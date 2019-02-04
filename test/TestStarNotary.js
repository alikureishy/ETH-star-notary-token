const StarNotary = artifacts.require("StarNotary");
var accounts;
var owner;

var name = "Awesome star!";
var dec = "dec";
var mag = "mag";
var ent = "ent";
var story = "story";

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar(name, dec, mag, ent, story, tokenId, { from: accounts[0] })
    returned = await instance.tokenIdToStarInfo(tokenId);
    assert.equal(returned[0], name);
    assert.equal(returned[1], dec);
    assert.equal(returned[2], mag);
    assert.equal(returned[3], ent);
    assert.equal(returned[4], story);
    // assert.equal(
    //         web3.utils.keccak256((await instance.tokenIdToStarInfo(tokenId)).toString()),
    //         web3.utils.keccak256((name, dec, mag, ent, story).toString()))
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', "a", "b", "c", "d", starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.sellableStarPrices.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', "a", "b", "c", "d", starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', "a", "b", "c", "d", starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', "a", "b", "c", "d", starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    //1. Create a star
    let instance = await StarNotary.deployed();

    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    assert.equal(await instance.name(), "Twinkle");
    assert.equal(await instance.symbol(), "TWK");
});

it('lets 2 users exchange stars', async() => {
    let caller = accounts[0];
    let owner1 = accounts[1];
    let owner2 = accounts[2];
    let star_1_id = 6
    let star_2_id = 7

    // 1. Create 2 Stars
    let instance = await StarNotary.deployed();
    await instance.createStar('First Star', "a", "b", "c", "d", star_1_id, {from: owner1});
    await instance.createStar('Second Star', "a", "b", "c", "d", star_2_id, {from: owner2});
    await instance.setApprovalForAll(caller, true, {from: owner1})
    await instance.setApprovalForAll(caller, true, {from: owner2})

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    assert.equal(await instance.ownerOf.call(star_1_id), owner1);
    assert.equal(await instance.ownerOf.call(star_2_id), owner2);
    await instance.exchangeStars(star_1_id, star_2_id)

    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf.call(star_1_id), owner2);
    assert.equal(await instance.ownerOf.call(star_2_id), owner1);
});

it('lets a user transfer a star', async() => {
    let owner1 = accounts[1];
    let owner2 = accounts[2];
    let star_1_id = 8

    // 1. create a Star
    let instance = await StarNotary.deployed();
    await instance.createStar('First Star', "a", "b", "c", "d", star_1_id, {from: owner1});
    assert.equal(await instance.ownerOf.call(star_1_id), owner1);

    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(owner2, star_1_id, {from: owner1});

    // 3. Verify the star owner changed.
    assert.notEqual(await instance.ownerOf.call(star_1_id), owner1);
    assert.equal(await instance.ownerOf.call(star_1_id), owner2);
});
