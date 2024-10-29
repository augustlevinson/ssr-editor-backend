let baseUrl;
let clientUrl;

if (process.env.NODE_ENV === "development") {
  baseUrl = ""
  fetchUrl = "http://localhost:1337";
  clientUrl = "http://localhost:3000/";
} else {
    baseUrl = "/~caas23/editor";
    fetchUrl = "https://jsramverk-caas-aule.azurewebsites.net";
    clientUrl = `https://www.student.bth.se${baseUrl}`;
};

module.exports = { baseUrl, clientUrl };
