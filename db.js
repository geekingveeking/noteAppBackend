const moongoose=require('mongoose');
const mongoURI ='mongodb://0.0.0.0:27017/inotebook';


const connectToMongo=()=>{
    moongoose.connect(mongoURI, (err) => {
        if(err) console.log(err) ;
        else console.log("mongdb is connected");
       }
     );

}

module.exports= connectToMongo;