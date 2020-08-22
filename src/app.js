const path       = require( 'path' ),
      express    = require( 'express' ),
      bodyParser = require( 'body-parser' ),
      ejs        = require( 'ejs' ),      
      multer     = require( 'multer' ),
      sharp      = require( 'sharp' ),
      fs         = require( 'fs' )

const app = express()

let numberOfPosts = 0
var errorHandle = {
  error : false,
  message : "Go add More Images"
}

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

app.set( 'view engine', 'ejs' )
app.use( express.json() )
app.use( bodyParser.urlencoded( { extended : true } ) )
app.set( 'views', path.join( __dirname, '/views' ) )
app.use( express.static( path.join( __dirname,'/public') ) )

app.get('/', ( req, res ) => {
  try{
    const dir = path.join(__dirname,'/public/IMAGES')
    fs.readdir( dir, ( err, files ) => {
      if(err){
        numberOfPosts = 0
        errorHandle.error = true
        errorHandle.message = "Cannot Find Directory"
        return res.status(400).render("home",{ numberOfPosts , errorHandle })
      } else
          numberOfPosts = files.length
        res.render( "home.ejs" , { numberOfPosts , errorHandle } )
    })
  } catch( e ){
  }
})

app.post("/", upload.single('post'), async ( req, res )=>{
  try{
      if(req.file === undefined){
        throw new Error("cannot read")
      }
      const oldFile = req.file.buffer
      fs.writeFile(path.join(__dirname,'/public/oldImages',`oldpost-${++numberOfPosts}.png`),oldFile,(e)=>{
        if(e){
          errorHandle.error = true
          errorHandle.message = "File Uploading Error"
          return res.redirect("/")
        }
        else{
          errorHandle.error = false
          errorHandle.message = "Go Add More Images"
        }
      })
      const newFile = await sharp(req.file.buffer).resize({height:300,width:300}).png().toBuffer()
      fs.writeFile(path.join(__dirname,'/public/IMAGES',`post-${numberOfPosts}.png`),newFile,(e)=>{
        if(e){
          errorHandle.error = true
          errorHandle.message = "File Uploading Error"
          return res.redirect("/")
        }
        else{
          errorHandle.error = false
          errorHandle.message = "Go Add More Images"
          return res.redirect("/")
        }
      })
  } catch(e) {
    errorHandle.error = true
    errorHandle.message = "File Empty"
    return res.redirect("/")
  }
},(error,req,res,cb)=>{
 if(error){
    errorHandle.error = true
    errorHandle.message = error.message
    return res.redirect("/")
  }
})

app.listen( 5000, ( req, res ) => {
  console.log( "Server Started" )
})