from flask import Response, request
from flask_restful import Resource
from models import User, Following
from . import get_authorized_user_ids
import json
import decorators
import flask_jwt_extended
from flask_jwt_extended import jwt_required
class SuggestionsListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    @jwt_required()
    def get(self):

        following =get_authorized_user_ids(self.current_user)
        data = User.query.filter(~User.id.in_(following)).limit(7).all()
        
        if not data:
            
            return Response(json.dumps({'message': 'Invalid Request'}), mimetype="application/json", status=400)
        else:
            
            data = [
                item.to_dict() for item in data 
            ]
            return Response(json.dumps(data), mimetype="application/json", status=200)
        


def initialize_routes(api):
    api.add_resource(
        SuggestionsListEndpoint, 
        '/api/suggestions', 
        '/api/suggestions/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
