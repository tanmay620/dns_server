const dgram = require('node:dgram');
const dnsPacket=require('dns-packet');
const server = dgram.createSocket('udp4');

const db={
    'google.com':{
        type:'A',
        data:'172.253.118.101'
    },
    'youtube.com':{
        type:'A',
        data:'142.251.175.136'
    },
    'blog.google.com':{
        type:'CNAME',
        data:'google.com'
    },
    'test.com':'127.0.0.1',
  
};


server.on('message',(msg,rinfo)=>{
    const incomingRequest=dnsPacket.decode(msg);
    console.log({
        questions: incomingRequest.questions,
        rinfo
    })

    
    // console.log(msg.toString()) when passed this line through an object nodejs used util.inspect
    //  which shows the byte data of the part of string,charchter which can not be decode by toString
    //  utf-8 format is represented by unicode replacement character(U+FFFD)
    //  this happens by adding escape sequence around the string 

    const ipFromDb=db[incomingRequest.questions[0].name];
   if(ipFromDb){
    const ans=dnsPacket.encode({
        type:'response',
        id:incomingRequest.id,
        flags:dnsPacket.AUTHORITATIVE_ANSWER,
        questions:incomingRequest.questions,
        answers:[{
            type:ipFromDb.type,
            class:'IN',
            name:incomingRequest.questions[0].name,
            data:ipFromDb.data,
        }]
    })
    server.send(ans,rinfo.port,rinfo.address);
   }
})

server.bind(53,()=>console.log('DNS server running on port 53'))


