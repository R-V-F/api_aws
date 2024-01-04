async function connect(mysql){
  if(global.connection && global.connection.state !== 'disconnected')
      return global.connection;

  
      const connection = await mysql.createConnection("mysql://root:renan123@localhost:3306/db_sistema");
      console.log("Conectou no MySQL!");
  global.connection = connection;
  return connection;
}

async function main() {
  const mysql = require("mysql2");
  const express = require("express");
  var cors = require('cors');
  const app = express();
  const port = 3123;
  const con = await connect(mysql);
  app.use(cors());


  let query = 'SELECT * FROM db_sistema.padrao WHERE TIMESTAMPDIFF(MINUTE, timestamp, NOW()) < 11 ORDER BY timestamp DESC';
  let query2h = "SELECT * FROM db_sistema.padrao WHERE TIMESTAMPDIFF(MINUTE, timestamp, NOW()) < 1440 ORDER BY timestamp ASC";

  app.get("/current", cors() ,function (req, res) {
    con.query(query, (error, results, fields) => {
      if (error) throw error;
        
      console.log('Query results:', results.length);
      let current_lives = [];
      for(let i = 0; i < results.length; i++) {
        if(i == 0) {
          current_lives.push(results[i]);
          continue; 
        }
        console.log(`${results[i].timestamp - results[i-1].timestamp}`);

        if(results[i].timestamp - results[i-1].timestamp < -100000) break;
        console.log(results[i].timestamp);
        console.log(results[i].channel);
        current_lives.push(results[i]);
      }
      console.log(current_lives);
      res.send({msg:current_lives});
    });
  });

  app.get("/two_hours", cors() ,function (req, res) {
    
    con.query(query2h, (error, results, fields) => {
      if (error) throw error;
      res.send({msg:results});
    });
  });
  app.get("/custom/:timelimit", cors() ,function (req, res) {
    let timelimit = req.params.timelimit;
    let custom_query = `SELECT * FROM db_sistema.padrao WHERE TIMESTAMPDIFF(MINUTE, timestamp, NOW()) < ${timelimit} ORDER BY timestamp ASC`;
    con.query(custom_query, (error, results, fields) => {
      if (error) throw error;
      res.send({msg:results});
    });
  });

  
  app.listen(port, async function () {
    console.log(`Example app listening on port ${port}!`);
    
  });
}

main();