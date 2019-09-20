var Config=require("./config/config");
var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var ejs=require("ejs");

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

// TEAMS PARTICIPATING
const teams=[
    {
        'NAME':'A',
    },
    {
        'NAME':'B',
    },
    {
        'NAME':'C',
    },
    {
        'NAME':'D'
    },
    {
        'NAME':'E',
    },
    {
        'NAME':'F',
    },
    {
        'NAME':'G',
    },
    {
        'NAME':'H',
    },
]; 



// shuffle function to shuffle teams everytime we get a request
function shuffle() {
    var currentIndex = teams.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = teams[currentIndex];
      teams[currentIndex] = teams[randomIndex];
      teams[randomIndex] = temporaryValue;
    }
}

// USED TO INCREMENT DATE
function incrementDate(date){
    date.setDate(date.getDate()+1);
    //console.log(date.toDateString());
    return date;
}



// FUNCTION USED FOR CREATING FIXTURE OF HALF LENGTH
function createFixture(result){
    
    for(let i=0,j=1;i<teams.length && j<teams.length;i=i+2,j=j+2){
        result.push({
            team1:teams[i].NAME,
            team2:teams[j].NAME,
        });
    }
    for(let i=1,j=2;i<=3 && j<=4;i=i+2,j=j+2){  
        result.push({
            team1:teams[i].NAME,
            team2:teams[j].NAME
        })
    }
    result.push({
        team1:teams[0].NAME,
        team2:teams[teams.length-1].NAME
    })
    result.push({
        team1:teams[5].NAME,
        team2:teams[6].NAME
    })
    for(let j=2;j<=teams.length-2;j++){
        for(let i=0,k=j;i<teams.length && k<teams.length;i++,k++){
            result.push({
                team1:teams[i].NAME,
                team2:teams[k].NAME,
            });
        }
    }
}

//USED TO REPAIR ONE OCCURING CONFLICT
function repairFixture(result){
    let temp=result[28];
    result[28]=result[29];
    result[29]=temp;
}

// USED TO CONVERT STRING TO DATE OBJECT
function convertDate(date){
    var parts =date.split('-'); 
    var mydate = new Date(parts[0], parts[1] - 1, parts[2]);
    return mydate;
}
 
// GET REQUEST FOR HOME PAGE
app.get("",(req,res)=>{
    res.render('index');
});

// HANDLING POST REQUEST
app.post("/fixture",(req,res)=>{
    let finalResult=new Array();
    let result=new Array();
    shuffle(); // SHUFLLE THE TEAMS SO THAT WE GET A NEW FIXTURE EVERY TIME
    createFixture(result); // CREATING HALF OF THE FIXTURES
    createFixture(result); // CREATING ANOTHER HALF
    repairFixture(result); // BOTTOM AND TOP OF HALVES COLLIDE SO REPAIR THEM

    let date=req.body.date; // Get date from the request
    let mydate=convertDate(date); // Convert string date to Date object
    let isWeekend=false;
    let count=0;
    for(let i=0;i<56;i++){
        if(mydate.getDay()==0 || mydate.getDay()==6){
            isWeekend=true;
        }                
        else{
            isWeekend=false;
        }
        if(isWeekend==false){
            if(i<27){           
                finalResult.push({
                    date:mydate.toDateString(),
                    teamA:result[i].team1,
                    teamB:result[i].team2,
                    venue:result[i].team1,
                    weekend:isWeekend,
                })
            }
            else{               // second match at TEAM B's ground
                finalResult.push({
                    date:mydate.toDateString(),
                    teamA:result[i].team1,
                    teamB:result[i].team2,
                    venue:result[i].team2,
                    weekend:isWeekend
                })
            }
        }else{
            if(i<27){           
                finalResult.push({
                    date:mydate.toDateString(),
                    teamA:result[i].team1,
                    teamB:result[i].team2,
                    teamC:result[i+1].team1,
                    teamD:result[i+1].team2,
                    venue1:result[i].team1,
                    venue2:result[i+1].team1,
                    weekend:isWeekend,
                })
                i++;
            }
            else{           
                finalResult.push({
                    date:mydate.toDateString(),
                    teamA:result[i].team1,
                    teamB:result[i].team2,
                    teamC:result[i+1].team1,
                    teamD:result[i+1].team2,
                    venue1:result[i].team2,
                    venue2:result[i+1].team2,
                    weekend:isWeekend,
                })
                i++;
            } 
        }
        
        incrementDate(mydate);
    }
    //console.log(count);
   // res.send(result);
    res.render("fixtures",{finalResult:finalResult});
});

// LISTENING TO THE SERVER
const port=Config.port;
app.listen(port,()=>{
    console.log("Your server has started on PORT:"+port);
    console.log("If you want to change your port, make changes in ENV files");
});