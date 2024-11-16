from flask import Flask, render_template, jsonify, g
import psycopg2
import geojson

app = Flask(__name__)

connection = psycopg2.connect(
    user="postgres",
    password="postgres",
    host="localhost",
    port="5432",
    database="GSS"
)

print('Connection Success')
cur = connection.cursor()

@app.route("/map.html")
def get_map():
    return render_template("index.html")

@app.route("/stats.html")
def get_stats():
    return render_template("chart.html")

@app.route('/geojson')
def get_geojson_data():
    cur.execute(
            """SELECT id, name, schlüssel, ST_AsGeoJSON(geom) AS geometry FROM data;""")
    multipolygon_geojson = cur.fetchall()

    features = []
    index = 1
    for row in multipolygon_geojson:
        geometry = geojson.loads(row[3])
        feature = {
            "type": "Feature",
            "geometry": geometry,
            "id": index,
            "properties": {
                'id': row[0],
                'name': row[1],
                'schlüssel': row[2]
            }
        }
        features.append(feature)

        index +=1 

    feature_collection = {
        "type": "FeatureCollection",
        "features": features
    }

    return jsonify(feature_collection)

#Chat Creation
@app.route('/population/espop')
def get_espop_data():
    #cur.execute('SELECT category, COUNT(*) FROM your_table GROUP BY category')
    cur.execute("select distinct on (year) 'Esslingen Population' as title, year, poppersqkm from espop order by year;")
    data = cur.fetchall()
    
    features = []

    for row in data:
        feature = {
            "title": row[0],
            "year": row[1],
            "population": row[2],
        }

        features.append(feature)

    return jsonify(features)

@app.route('/population/karlpop')
def get_karlpop_data():
    #cur.execute('SELECT category, COUNT(*) FROM your_table GROUP BY category')
    cur.execute("select distinct on (year) 'Karlsruhe Population' as title, year, poppersqkm from karlpop order by year;")
    data = cur.fetchall()
    
    features = []

    for row in data:
        feature = {
            "title": row[0],
            "year": row[1],
            "population": row[2],
        }

        features.append(feature)

    return jsonify(features)

@app.route('/population/ludpop')
def get_ludpop_data():
    #cur.execute('SELECT category, COUNT(*) FROM your_table GROUP BY category')
    cur.execute("select distinct on (year) 'Ludwigsburg Population' as title, year, poppersqkm from ludpop order by year;")
    data = cur.fetchall()
    
    features = []

    for row in data:
        feature = {
            "title": row[0],
            "year": row[1],
            "population": row[2],
        }

        features.append(feature)

    return jsonify(features)


# Simulated data
#Chat Creation
@app.route('/simulation/espop')
def get_essim_data():
    #cur.execute('SELECT category, COUNT(*) FROM your_table GROUP BY category')
    cur.execute("SELECT cityname || ' Simulated' as title, year::int, pop::int FROM popprojection WHERE cityname = 'Esslingen' ORDER BY year;")
    data = cur.fetchall()
    
    features = []

    for row in data:
        feature = {
            "title": row[0],
            "year": row[1],
            "population": row[2],
        }

        features.append(feature)

    return jsonify(features)

@app.route('/simulation/karlpop')
def get_karlsim_data():
    #cur.execute('SELECT category, COUNT(*) FROM your_table GROUP BY category')
    cur.execute("SELECT cityname || ' Simulated' as title, year::int, pop::int FROM popprojection WHERE cityname = 'Karlsruhe' ORDER BY year;")
    data = cur.fetchall()
    
    features = []

    for row in data:
        feature = {
            "title": row[0],
            "year": row[1],
            "population": row[2],
        }

        features.append(feature)

    return jsonify(features)

@app.route('/simulation/ludpop')
def get_ludsim_data():
    #cur.execute('SELECT category, COUNT(*) FROM your_table GROUP BY category')
    cur.execute("SELECT cityname || ' Simulated' as title, year::int, pop::int FROM popprojection WHERE cityname = 'Ludwigsburg' ORDER BY year;")
    data = cur.fetchall()
    
    features = []

    for row in data:
        feature = {
            "title": row[0],
            "year": row[1],
            "population": row[2],
        }

        features.append(feature)

    return jsonify(features)

if __name__ == '__main__':
    # app.run(debug=True, port=5000)
    app.run(debug=True)
