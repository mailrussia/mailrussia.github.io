console.log("mailrussia"),document.getElementById("goButton").addEventListener("click",(()=>{console.log("click"),fetch("http://localhost:4444/api/emails").then((o=>o.json())).then((o=>{console.log(o)}))}));