from flask import Response, request
from flask_restful import Resource
from models import Post, User, db
from . import can_view_post, get_authorized_user_ids
import json
from sqlalchemy import and_

def get_path():
    return request.host_url + 'api/posts/'

class PostListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    def get(self):
                        
        postLimit = request.args.get('limit')
       
        #if given no limit do default
        if postLimit == None:
            postLimit=20 #should limit be 20 or 10, tests say 20, rubrick says 10
        #error if limit not a number or out of range
        elif postLimit.isnumeric() != True or int(postLimit) >50 or int(postLimit) <1 :
            return Response(json.dumps({'message': 'Invalid Request'}), mimetype="application/json", status=400)

        
        data=Post.query.filter(Post.user_id.in_(get_authorized_user_ids(self.current_user))).limit(postLimit).all()
        
        
        if not data:
            return Response(json.dumps({'message': 'Invalid Request'}), mimetype="application/json", status=400)
        else:
            
            data = [
                item.to_dict() for item in data
            ]
            return Response(json.dumps(data), mimetype="application/json", status=200)




    def post(self):
        body = request.get_json()
        image_url = body.get('image_url')
        if image_url == None:
            return Response(json.dumps({'message': 'image_url required to post'}), mimetype="application/json", status=400)
        caption = body.get('caption')
        alt_text = body.get('alt_text')
        user_id = self.current_user.id # id of the user who is logged in
        
        # create post:
        try: 
            post = Post(image_url, user_id, caption, alt_text)
            db.session.add(post)
            db.session.commit()
        except Exception:
            return Response(json.dumps({'message': 'already been posted'}), mimetype="application/json", status=400)
              
        return Response(json.dumps(post.to_dict()), mimetype="application/json", status=201)
        
class PostDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
        
    def patch(self, id):
        if id.isnumeric() != True:
            return Response(json.dumps({'message': 'Invalid Request'}), mimetype="application/json", status=400)

        post = Post.query.get(id)

        # a user can only edit their own post:
        if not post or post.user_id != self.current_user.id:
            return Response(json.dumps({'message': 'Post does not exist'}), mimetype="application/json", status=404)
       
        body = request.get_json()
        
        post.image_url = body.get('image_url') or post.image_url
        post.caption = body.get('caption') or post.caption
        post.alt_text = body.get('alt_text') or post.alt_text
        
        # commit changes:
        db.session.commit()        
        return Response(json.dumps(post.to_dict()), mimetype="application/json", status=200)
    
    def delete(self, id):
        if id.isnumeric() != True:
            return Response(json.dumps({'message': 'Invalid Request'}), mimetype="application/json", status=400)
        # a user can only delete their own post:
        post = Post.query.get(id)
        if not post or post.user_id != self.current_user.id:
            return Response(json.dumps({'message': 'Post does not exist'}), mimetype="application/json", status=404)
       
        Post.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Post {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)

    def get(self, id):
        if id.isnumeric() != True:
            return Response(json.dumps({'message': 'Invalid Request'}), mimetype="application/json", status=400)

        post = Post.query.get(id)

        # if the user is not allowed to see the post or if the post does not exist, return 404:
        if not post or not can_view_post(post.id, self.current_user):
            return Response(json.dumps({'message': 'Post does not exist'}), mimetype="application/json", status=404)
        
        return Response(json.dumps(post.to_dict()), mimetype="application/json", status=200)

def initialize_routes(api):
    
    api.add_resource(
        PostListEndpoint, 
        '/api/posts', '/api/posts/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
    api.add_resource(
        PostDetailEndpoint, 
        '/api/posts/<id>', '/api/posts/<id>/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )