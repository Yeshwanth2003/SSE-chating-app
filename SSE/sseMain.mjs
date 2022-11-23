import * as http  from 'http'
import {readFile} from 'fs'
import * as url from 'url'

let server = http.createServer()
server.listen(80)

let clients = [];

server.on('request',requestHandler)

function  requestHandler(req,res){
     let urlPath = url.parse(req.url).pathname
     let urlQuery = url.parse(req.url).query
     if(urlPath  == '/post'){ 
          let data ="" ;
          req.on('data',(d)=>{
           data+=d.toString();
      })
      req.on('close',()=>{
           console.log(data);
           let obj = JSON.parse(data)
           let to = obj.to;
           let msg = obj.msg
           let from = obj.from
           let rply = JSON.stringify({msg,from});
           
           clients.forEach(v=>{
               if(v.name == to){
                    v.res.write('data: '+rply+'\n\n');
                    return;
               }
          })
     })
     
}
else if(urlPath == '/events'){

        res.setHeader('access-control-allow-origin','*')
          console.log(req.url);
          let obj = {
               name:urlQuery.split('=')[1],
               res
          }
          clients.push(obj)
          res.setHeader('content-type','text/event-stream')
          res.writeHead(200);

          req.on("close",()=>{
               clients = clients.filter(c=>c.res!=res);
               console.log('Closed; remaining'+clients.length);
          })
          
     }
     else{
          readFile('./Main.html',(err,data)=>{
               res.end(data)
          })
     }
}