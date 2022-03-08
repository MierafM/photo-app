from flask import (
    request, make_response, render_template, redirect
)
from models import User
import flask_jwt_extended

def logout():
    # hint:  https://dev.to/totally_chase/python-using-jwt-in-cookies-with-a-flask-app-and-restful-api-2p75
    response = make_response(redirect('/login', 302))
    flask_jwt_extended.unset_jwt_cookies(response)
    return response

def login():
    if request.method == 'POST':
        # authenticate user here. If the user sent valid credentials, set the
        # JWT cookies:
        # https://flask-jwt-extended.readthedocs.io/en/3.0.0_release/tokens_in_cookies/
        print(request.form)
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        print(username, " ", password, " ", user)
        if user is None:
            return render_template(
            'login.html', 
            message='Invalid username'
            )
        if user.check_password(password):
            token = flask_jwt_extended.create_access_token(identity=user.id)
            response = make_response(redirect('/', 302))
            flask_jwt_extended.set_access_cookies(response, token)
            return response
        else:
            return render_template(
            'login.html', 
            message='Invalid password'
            )
   
    else:
        return render_template(
            'login.html'
        )

def initialize_routes(app):
    app.add_url_rule('/login', 
        view_func=login, methods=['GET', 'POST'])
    app.add_url_rule('/logout', view_func=logout)