# -*- coding: utf-8 -*-
from flask import Flask

app = Flask(__name__)

@app.route('/test')
def test():
    return "Test OK - Flask fonctionne sans erreur d'encodage"

if __name__ == '__main__':
    app.run(debug=True, port=5000)