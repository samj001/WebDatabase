//import libraries
let alert = require('alert');

let express = require('express');
let app = express();

let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(':memory:');

//set port
let port = normalizePort(process.env.PORT || '3000');
app.set('port',port);


function normalizePort(val) {
    let port = parseInt(val, 10);
  
    if (isNaN(port)) {
      return val;
    }
  
    if (port >= 0) {
      return port;
    }
    return false;
}


//initialize database
db.serialize(function() {   
    db.run("DROP TABLE IF EXISTS NFCONTENT");
    db.run("CREATE TABLE IF NOT EXISTS NFCONTENT (id INTEGER PRIMARY KEY AUTOINCREMENT,name VARCHAR(100),language VARCHAR(20), length INTEGER,release_date DATE)");

    db.run(`INSERT INTO NFCONTENT VALUES (1,"The Shawshank Redemption","english",144,"1994-09-13")`);
    db.run(`INSERT INTO NFCONTENT VALUES (2,"The Godfather","italian",175,"1972-04-06")`);
    db.run(`INSERT INTO NFCONTENT VALUES (3,"The Dark Knight","english",152,"2008-07-14")`);
    db.run(`INSERT INTO NFCONTENT VALUES (4,"12 Angry Man","english",96,"1957-04-10")`);
    db.run(`INSERT INTO NFCONTENT VALUES (5,"Forrest Gump","english",144,"1994-06-23")`);
});

app.use(express.static('public_html'));
app.use(express.urlencoded({ extended:false}));


//validate input
function Validate(name,length)
{
    result = true;
    if(name=="") 
    {
        alert("Input denied! Name is required!!");
        result = false;
    }

    else if (isNaN(parseInt(length)))
    {
        alert("Input denied! Length must be a number!!");
        result = false;
    }

    else
    {
        alert("Data received!");
    }
    return result;
}


app.post('/NFDB',function(req,res,next) {
    let name = req.body.film_name;
    let language = req.body.language;
    let length = req.body.length;    
    let release_date = req.body.release_date;  

    if(Validate(name,length))
    {
        let stmt = db.run(`INSERT INTO NFCONTENT (name, language, length, release_date) VALUES ("${name}","${language}",${parseInt(length)},"${release_date}")`);
        
    }
    res.status(200).redirect('/netflix.html');

});


app.get('/NFDB', function (req, res) 
{
    let html = `<!doctype html><html lang="en">\
                <head>\
                <title>Netflix Database</title>\
                <meta charset="utf-8">\
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">\
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-aFq/bzH65dt+w6FI2ooMVUpc+21e0SRygnTpmBvdBgSdnuTN7QbdgL+OapgHtvPp" crossorigin="anonymous"></head>\
                <body>\
                <div class="container">\
                <h3>Netflix Database</h3>\
                <table class="table">\
                <thead class="thead-dark"><tr>\
                <th>ID</th><th>Name</th><th>Language</th><th>Length</th><th>Release Date</th>\
                <tr></thead><tbody>`;
    
    db.all('SELECT * FROM NFCONTENT',function(err,rows){
        if (err) {return console.error(err.message)};
        
        if (rows.length === 0)
        {
            html += '<tr><td colspan="5"> No data found </td></tr>';
        }
        
        else 
        {
            rows.forEach (function (row)
                {
                    html += `<tr>\
                            <td>${row.id}</td>\
                            <td>${row.name}</td>\
                            <td>${row.language}</td>\
                            <td>${row.length}</td>\
                            <td>${row.release_date}</td>`;
                });
        }

        html += `</tbody></table></div></body></html>`;
        
        res.send(html);
    });
});

app.listen(port,function(){
    console.log(`Web server running at: http://localhost:${port}`);
    console.log("Type Ctrl+C to shut down the web server");
});

