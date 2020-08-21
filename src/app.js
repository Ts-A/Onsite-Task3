const path       = require( 'path' ),
      express    = require( 'express' ),
      bodyParser = require( 'body-parser' ),
      ejs        = require( 'ejs' ),      
      multer     = require( 'multer' ),
      sharp      = require( 'sharp' ),
      fs         = require( 'fs' )

const app = express()

const bufferArray = []
let numberOfPosts = 0

app.set( 'view engine', 'ejs' )
app.use( express.json() )
app.use( bodyParser.urlencoded( { extended : true } ) )
app.set( 'views', path.join( __dirname, '/views' ) )
app.use( express.static( path.join( __dirname,'/public') ) )

app.get( '/', ( req, res ) => {
  try{
    const dir = path.join(__dirname,'/public/IMAGES')
    fs.readdir( dir, ( err, files ) => {
      if(err){
        numberOfPosts = 0
      } else{
        numberOfPosts = files.length
        res.render( "home.ejs" , { numberOfPosts , error : false } )
      } 
    })
  } catch( e ){
    // res.redirect("/")
    return res.status(400).render("home",{ numberOfPosts , error : true , message : "errorororr" })
    // res.status( 400 ).send( "error" )
  }
})

const upload = multer({
  limits : {
    fileSize : 100000000
  },
  fileFilter(req,file,cb){
    if(!file.originalname.match(/\.(jpeg|jpg|png)$/))
      cb(new Error('Wrong file type'))
    cb(undefined,true)
  }
})

app.post("/", upload.single('post'), async ( req, res )=>{
  try{
      console.log(req.body)
      if(req.file === undefined){
        throw new Error("cannot read")
      }
      const newFile = await sharp(req.file.buffer).resize({height:300,width:300}).png().toBuffer()
      bufferArray.push(newFile)
      fs.writeFile(path.join(__dirname,'/public/IMAGES',`post-${++numberOfPosts}.png`),newFile,(e)=>{
        if(e)
          return res.status(400).render("home",{ numberOfPosts , error : true , message : "Error" })
          else
        return res.render("home",{ numberOfPosts , error : false , message : "Added" })
      })
  } catch(e) {
    return res.status(400).render("home",{ numberOfPosts , error : true , message : "Check Error" })
  }
},(error,req,res,cb)=>{
  if(error)
    return res.status(400).render("home",{ numberOfPosts , error : true , message : "Error" })
})

app.listen( 5000, ( req, res ) => {
  console.log( "Server Started" )
})