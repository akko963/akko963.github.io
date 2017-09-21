
class Deck{
    constructor(){
        this._deck=[];
        this.populate(this._deck)
    }
    deal(){
        if (this._deck.length==0)
            return ;
        else if (this._deck.length==1)
            return this._deck.pop();

        let pick = Math.floor(Math.random()*this._deck.length);
        let temp = this._deck[pick];
        this._deck[pick]= this._deck[this._deck.length-1];
        this._deck[this._deck.length-1] = temp;
        return this._deck.pop();
    }
    populate(){
        const a = 0x1f000;  // Base number begins with this hex
        var z, offset;
        for (let j=0; j <4; j++) {
            for (let k = 1; k < 14; k++) {
                z = k < 12 ? k : k + 1;  // skip the bit 0xc0 (knight)
                offset = (j << 4 ) + 0xa0 + z;
                this._deck.push(a + offset);
            }
        }
        return this
    }
    reset(){
        this._deck=[];
        this.populate(this._deck);
        return this
    }
    shuffle(){
        var pick, temp;
        let end = this._deck.length;
        while(end--){
            pick = Math.floor(Math.random()*end);
            temp = this._deck[pick] ;
            this._deck[pick] = this._deck[end] ;
            this._deck[end] = temp;
        }
        return this
    }
    print(){
        let x = this._deck.length;
        while(x--)
            console.log(x, this._deck[x].toString(16));
        return this
    }
}
class Player{
    constructor(name){
        if  (!(name instanceof String || typeof name === "string"))
            this.name = 'Anonymous'+Math.floor(Math.random()*100);
        else
            this.name = name;
        this._hand=[];

    }
    hit(deck) {
        let card = deck.deal()
        this._hand.push(card)
        return card
    }
    ace_count(){
        var ace = 0;
        for (let i =0 ;i < this._hand.length; i++)
            if ( card_value(this._hand[i])==11)
                ace += 1
        return ace
    }
    total() {
        var total = 0;
        for (let i =0 ;i < this._hand.length; i++){
            total += card_value(this._hand[i])
        }
        let aces = this.ace_count()
        while (total>21 && aces>0 ){
            aces -= 1 ;
            total -= 10;
        }
        return total;
    }
    showhand(hidden = false){
        if (hidden)
            return Array(this._hand.length).fill(127136)
        return this._hand.slice()
    }
}

class AIplayer extends Player{
    constructor(name="AI"){
        super(name);
    }
}
class Game{
    constructor(){
        this._gamedeck= new Deck()
        this._players =[]
        this._pass = [false,false]
        this._turn= 1
    }
    add(player){
        this._players.push(player)
        return this
    }
    start(){
        let repeat=2
        while(repeat--)
            for (let i=0;i<this._players.length;i++){
                this._players[i].hit(this._gamedeck)
            }
        this._players[0].showhand()
        this._players[1].showhand()
        return this;
    }
    turn(id=-1){

        if (id === this._turn)
            return this._players[parseInt(id)].showhand()
        return false;
    }
    passing(){
        this._pass[this._turn] = true
        this._turn = (this._turn +1) % this._players.length
        if ((this._pass[0]+this._pass[1])==2)
            return false
        return true
    }
    advance() {
        let newcard = this._players[this._turn].hit(this._gamedeck)
        this._turn = (this._turn +1) % this._players.length
        return newcard
    }
}
function card_value(card){
    val = card &15
    if (val === 1)
        return 11
    else if (val < 11)
        return val
    else
        return 10
}
mygame = new Game();
p1 = new Player('john');
p2 = new Player('dave');
mygame.add(p1).add(p2).start();


$(document).ready(function(){
    var pos0 = $("#hand0").offset()
    var pos1 = $("#hand1").offset()

    const mid = pos0.left + $('#hand0').width()*0.5
    const upper =pos0.top  + $('#hand0').height()*0.4
    const lower =pos1.top + $('#hand1').height()*0.4

    pos0.top = upper
    pos0.left = mid-100
    pos1.top = lower
    pos1.left = pos0.left

    display_hand(0,hidden=true)
    display_hand(1)
    $("#deck"+[mygame._turn]).css("border","3px solid lightsalmon")

    function add_message(top=false,bottom=false){
        var node
        if (top) {
            node = $("<div class='overlay'></div>").text(top)
            node.offset(pos0)
            $("#deck0").append(node)
        }
        if (bottom) {
            node = $("<div class='overlay'></div>").text(bottom)
            node.offset(pos1)
            $("#deck1").append(node)
        }
    }
    function display_hand(id, hidden=false){
        hand = mygame._players[id].showhand(hidden)
        for (let i = 0 ; i <hand.length; i++)
            $("#hand"+id).append($("<span class='cards'></span>").html("&#"+hand[i]+";"))
    }

    $("#1").click(function(event){
        if (mygame.turn(1)) {
            last_card =mygame.advance()
            $("#hand1").append($("<span class='cards'></span>").html("&#"+last_card+";"))
            $("#deck1").css("border","1px solid black")
            $("#deck0").css("border","3px solid lightsalmon")
            computer()
            if(mygame._pass[1]+mygame._pass[0]==2)
                game_end()
        }
    })
    $("#10").click(function(event){

        if (mygame.turn(1)) {
            to_continue = mygame.passing()
            $("#1").attr("disabled", true);
            $("#10").attr("disabled", true);
            $("#deck1").css("border", "1px solid black")
            $("#deck0").css("border", "3px solid lightsalmon")
            if (!to_continue) {  // game-end
                game_end()
            }
            else
                computer()
            if(mygame._pass[1]+mygame._pass[0]==2)
                game_end()        }
    })
    function computer(){
        var pass=false;
        if (mygame._pass[1])
            while(!pass)
            {
                mygame._turn= 0 // skipping because player passed
                if (mygame._players[0].total() < 17) {
                    mygame.advance()
                    $("#hand0").append($("<span class='cards'></span>").html("&#127136;"))
                }
                else {
                    pass = true
                    mygame.passing()

                }
            }
        else {
            if (mygame._players[0].total() < 17)
                mygame.advance()
            else {
                mygame.passing()
            }
        }
        $("#deck0").css("border", "1px solid black")
        $("#deck1").css("border", "3px solid lightsalmon")
    }
    function sleep(ms){
        return new Promise(resolve => setTimeout(resolve,ms));
    }
    function game_end(){
        $("#hand0").empty()
        display_hand(0)

        if (mygame._players[0].total() > 21 || mygame._players[1].total()> 21) {
            if (mygame._players[0].total() > 21 && mygame._players[1].total() > 21)
                add_message(top = 'Draw', bottom = 'Draw')
            else if (mygame._players[0].total() > 21)
                add_message(top = 'Lose', bottom = 'Win!')
            else
                add_message(top = 'Win!', bottom = 'Lose')
        }
        else if(mygame._players[0].total() > mygame._players[1].total() )
            add_message(top = 'Win!', bottom = 'Lose')
        else if(mygame._players[0].total() < mygame._players[1].total() )
            add_message(top = 'Lose', bottom = 'Win!')
        else
            add_message(top = 'Draw', bottom = 'Draw')
    }
})