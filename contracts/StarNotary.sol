pragma solidity >=0.4.24;

//Importing openzeppelin-solidity ERC-721 implemented Standard
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721 {

    // Star data
    struct Star {
        string name;
        string dec;
        string mag;
        string ent;
        string story;
    }

    // Implement Task 1 Add a name and symbol properties
    string public constant name = "Twinkle";
    string public constant symbol = "TWK";

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public sellableStarPrices;


    // Create Star using the Struct
    function createStar(string memory _name, string memory _dec, string memory _mag, string memory _ent, string memory _story, uint256 _tokenId) public { // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name, _dec, _mag, _ent, _story); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping sellableStarPrices, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        sellableStarPrices[_tokenId] = _price;
    }


    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    function buyStar(uint256 _tokenId) public  payable {
        require(sellableStarPrices[_tokenId] > 0, "The Star should be up for sale");

        uint256 starCost = sellableStarPrices[_tokenId];
        require(msg.value > starCost, "You need to have enough Ether");

        address ownerAddress = ownerOf(_tokenId);
        require(msg.sender != ownerAddress, "Can't buy a star from yourself");

        _transferFrom(ownerAddress, msg.sender, _tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        address payable ownerAddressPayable = _make_payable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers
        ownerAddressPayable.transfer(starCost);
        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    function lookUptokenIdToStarInfo (uint _tokenId) public view returns (string memory, string memory, string memory, string memory, string memory) {
        Star memory star = tokenIdToStarInfo[_tokenId];
        return (star.name, star.dec, star.mag, star.ent, star.story);
    }

    // Implement Task 1 Exchange Stars function
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        //1. Passing to star tokenId you will need to check if the owner of _tokenId1 or _tokenId2 is the sender
        address caller = msg.sender;
        require(_isApprovedOrOwner(caller, _tokenId1), "Caller must be approved to exchange the tokens");
        require(_isApprovedOrOwner(caller, _tokenId2), "Caller must be approved to exchagne the tokens");

        //2. No need to check for price

        //3. Use _transferFrom function to exchange the tokens.
        address owner1 = this.ownerOf(_tokenId1);
        address owner2 = this.ownerOf(_tokenId2);
        _transferFrom(owner1, owner2, _tokenId1);
        _transferFrom(owner2, owner1, _tokenId2);
    }

    // Implement Task 1 Transfer Stars
    function transferStar(address _to1, uint256 _tokenId) public {
        // This automatically checks if the sender is the owner or approved on-behalf of the owner
        transferFrom(this.ownerOf(_tokenId), _to1, _tokenId);
    }

}