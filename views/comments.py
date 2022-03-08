from flask import Response, request
from flask_restful import Resource
from . import can_view_post
import json
from models import db, Comment, Post
from . import can_view_post, get_authorized_user_ids
import flask_jwt_extended
from flask_jwt_extended import jwt_required
class CommentListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    @jwt_required()
    def post(self):
        # Your code here
        body = request.get_json()
        post_id = body.get('post_id')
        text = body.get('text')
        if post_id == None or text == None or type(post_id) !=int or type(text) != str:
            return Response(json.dumps({'message': 'need valid text and post id to comment'}), mimetype="application/json", status=400)
        if can_view_post(post_id, self.current_user) != True:
            return Response(json.dumps({'message': 'post not found'}), mimetype="application/json", status=404)
        user_id = self.current_user.id
       
        comment = Comment(text, user_id,post_id)
        
        db.session.add(comment)
        db.session.commit()
        return Response(json.dumps(comment.to_dict()), mimetype="application/json", status=201)
        
class CommentDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    @jwt_required()
    def delete(self, id):
        # Your code here
        if id.isnumeric() != True:
            return Response(json.dumps({'message': 'Invalid Request'}), mimetype="application/json", status=400)
        comment = Comment.query.get(id)
        if not comment or comment.user_id != self.current_user.id:
            return Response(json.dumps({'message': 'Comment does not exist'}), mimetype="application/json", status=404)
       
        Comment.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Comment {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps({}), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        CommentListEndpoint, 
        '/api/comments', 
        '/api/comments/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}

    )
    api.add_resource(
        CommentDetailEndpoint, 
        '/api/comments/<id>', 
        '/api/comments/<id>',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
