#
# FLASK app for generating Weather data to consumable JSON-ified API
#
from flask import Flask, jsonify
import sqlalchemy
from sqlalchemy import create_engine, func
from sqlalchemy.orm import Session
from sqlalchemy.ext.automap import automap_base
import datetime as dt
import pandas as pd
import numpy as np

# Set up flask app
app = Flask(__name__)

# Create an engine to a SQLite database file called `hawaii.sqlite`
engine = create_engine("sqlite:///hawaii.sqlite")

# reflect an existing database into a new model
Base = automap_base()

# reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the tables
Measurement = Base.classes.measurement
Station = Base.classes.station

# Create our session (link) from Python to the database
session = Session(engine)

# Query for the dates and precipitation values from the last year.
# Convert the query results to a Dictionary using date as the key and tobs as the value.
# Return the json representation of your dictionary.
@app.route("/api/v1.0/precipitation")
def precipitation():
    # Return a list of measurement date and prcp information from the last year 
    final_date = session.query(Measurement.date).order_by(Measurement.date.desc()).first()
    last_year = dt.date(2017, 8, 23) - dt.timedelta(days=365)
    precip = session.query(Measurement.date, Measurement.prcp).filter(Measurement.date > last_year).order_by(Measurement.date).all()

    # Create a dictionary from the row data and append to a list
    precipitation_totals = []
    for result in precip:
        row = {}
        row["date"] = precip[0]
        row["prcp"] = precip[1]
        precipitation_totals.append(row)

    return jsonify(precipitation_totals)

# Return a json list of stations from the dataset.
@app.route("/api/v1.0/stations")
def stations():
    # Query all stations
    results = session.query(Station.station).all()
    # Convert list of tuples into normal list
    stations = list(np.ravel(results))
    return jsonify(stations)

# Return a json list of Temperature Observations (tobs) for the previous year
@app.route("/api/v1.0/tobs")
def tobs():
    # Query all tobs values
    prev_year = dt.date(2017, 8, 23) - dt.timedelta(days=365)
    tobs = session.query(Measurement.date, Measurement.tobs).filter(Measurement.date > prev_year).order_by(Measurement.date).all()
    # Totals
    tobs_total = []
    for result in tobs:
        row = {}
        row["date"] = tobs[0]
        row["tobs"] = tobs[1]
        tobs_total.append(row)
    return jsonify(tobs_total)

# Return a json list of the minimum temperature, the average temperature, and the max 
# temperature for a given start or start-end range.
@app.route("/api/v1.0/<start>")
def trip_one(start):
    # Given the start only, calculate TMIN, TAVG, and TMAX for all dates greater than and equal to the start date. 
    start_date = dt.datetime.strptime(start, "%Y-%m-%d")
    year = dt.timedelta(days=365)
    start = start_date-year
    end = dt.date(2017, 8, 23)
    trip_info = session.query(func.min(Measurement.tobs), func.avg(Measurement.tobs), func.max(Measurement.tobs)).filter(Measurement.date >= start).filter(Measurement.date <= end).all()
    trip = list(np.ravel(trip_info))
    return jsonify(trip)

# When given the start and the end date, calculate the TMIN, TAVG, and TMAX for dates 
# between the start and end date inclusive.
@app.route("/api/v1.0/<start>/<end>")
def trip_two(start, end):
    start_date = dt.datetime.strptime(start, "%Y-%m-%d")
    end_date = dt.datetime.strptime(end, "%Y-%m-%d")
    year = dt.timedelta(days=365)
    start = start_date-year
    end = end_date-year
    trip_info = session.query(func.min(Measurement.tobs), func.avg(Measurement.tobs), func.max(Measurement.tobs)).filter(Measurement.date >= start).filter(Measurement.date <= end).all()
    trip = list(np.ravel(trip_info))
    return jsonify(trip)

if __name__ == "__main__":
    app.run(debug=True)