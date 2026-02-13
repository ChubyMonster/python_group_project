from flask import Flask

app = Flask(__name__)

@app.route('/test')
def test():
    return "Test OK - pas d'erreur d'encodage"

if __name__ == '__main__':
    app.run(debug=True)