# Import dependencies
from flask import Flask, render_template, jsonify, redirect
import pymongo
import scrape_mars

# Setup flask app
app = Flask(__name__)

client = pymongo.MongoClient()

# Define app route
@app.route("/")
def index():
    mars = client.db.mars.find_one()
    return render_template("index.html", mars=mars)

@app.route("/scrape")
def scrape():
    mars= client.db.mars
    data = scrape_mars.scrape()
    mars.update(
        {},
        data,
        upsert=True
    )

    return redirect("http://localhost:5000/", code=302)

if __name__ == "__main__":

    app.run(debug=True)