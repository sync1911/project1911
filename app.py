from flask import Flask, render_template, request, redirect, url_for, session
import facebook
from functools import wraps
from aspendos_framework import analyze_metrics

app = Flask(__name__)
app.secret_key = '684c38d157348bb17a0d30310cf22a16'  # Replace with a strong secret key

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        access_token = request.form.get('access_token')
        graph = facebook.GraphAPI(access_token=access_token, version="3.0")
        user = graph.get_object("me")
        session['user_id'] = user['id']
        return redirect(url_for('analytics'))
    return render_template('dashboard.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('index'))

@app.route('/analytics')
@login_required
def analytics():
    metrics = {
        "Total Outbound Clicks": ...,
        "Total Link Clicks": ...,
        "Total Sales": ...,
        "Total Content Views": ...,
        "Total Add to Cart": ...,
        "Total Initiate Checkouts": ...,
        "Total Purchases": ...
    }

    rates, colors = analyze_metrics(metrics)
    return render_template('analytics.html', rates=rates, colors=colors)


@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

if __name__ == '__main__':
    app.run(debug=True)
