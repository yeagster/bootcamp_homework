# Import dependencies
import os
from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
import pandas as pd
import numpy as np

# Create app
app = Flask(__name__)

# Set up connection to SQL database
# Reflect and existing db into a new model, reflect the tables, and save the table references
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///bellybutton.sqlite"
belly_db = SQLAlchemy(app)
Base = automap_base()
Base.prepare(belly_db.engine, reflect=True)
Samples_Metadata = Base.classes.sample_metadata
Samples = Base.classes.samples

# Set up app route
@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

# Use pandas to run the SQL query and return a list of column names
@app.route("/names")
def names():
    """Return a list of sample names."""
    stmt = belly_db.session.query(Samples).statement
    df = pd.read_sql_query(stmt, belly_db.session.bind)
    return jsonify(list(df.columns)[2:])

@app.route("/metadata/<sample>")
def sample_metadata(sample):
    """Return the MetaData for a given sample."""
    sel = [
        Samples_Metadata.sample,
        Samples_Metadata.ETHNICITY,
        Samples_Metadata.GENDER,
        Samples_Metadata.AGE,
        Samples_Metadata.LOCATION,
        Samples_Metadata.BBTYPE,
        Samples_Metadata.WFREQ,
    ]
    results = belly_db.session.query(*sel).filter(Samples_Metadata.sample == sample).all()

    # Create a dictionary entry for each row of metadata information
    sample_metadata = {}
    for result in results:
        sample_metadata["sample"] = result[0]
        sample_metadata["ETHNICITY"] = result[1]
        sample_metadata["GENDER"] = result[2]
        sample_metadata["AGE"] = result[3]
        sample_metadata["LOCATION"] = result[4]
        sample_metadata["BBTYPE"] = result[5]
        sample_metadata["WFREQ"] = result[6]
    print(sample_metadata)
    return jsonify(sample_metadata)

# Filter the sample data based on the sample number
# We only want to keep rows with values above 1
@app.route("/samples/<sample>")
def samples(sample):
    """Return `otu_ids`, `otu_labels`,and `sample_values`."""
    stmt = belly_db.session.query(Samples).statement
    df = pd.read_sql_query(stmt, belly_db.session.bind)
    sample_data = df.loc[df[sample] > 1, ["otu_id", "otu_label", sample]]
    # Format the data to send as json
    data = {
        "otu_ids": sample_data.otu_id.values.tolist(),
        "sample_values": sample_data[sample].values.tolist(),
        "otu_labels": sample_data.otu_label.tolist(),
    }
    return jsonify(data)

if __name__ == "__main__":
    app.run()