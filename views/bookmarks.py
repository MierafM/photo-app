from flask import Response, request
from flask_restful import Resource
from models import Bookmark, db
import json
from . import can_view_post
from my_decorators  import secure_bookmark, handle_db_insert_error
from . import can_view_post, get_authorized_user_ids

class BookmarksListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def get(self):
             
        bookmarks = Bookmark.query.filter_by(user_id=self.current_user.id).all()
        bookmarks_list_of_dictionaries = [
            bookmark.to_dict() for bookmark in bookmarks
        ]
        return Response(json.dumps(bookmarks_list_of_dictionaries), mimetype="application/json", status=200)
    
    def post(self):

        body = request.get_json()
        
        if body == None:
           
            return Response(json.dumps({'message': 'post_id required to post'}), mimetype="application/json", status=400)
        post_id = body.get('post_id')
        print('given post id for bookmark', post_id, post_id.isnumeric())
        if not post_id or post_id.isnumeric() != True:
            
            return Response(json.dumps({'message': 'valid post_id required to post'}), mimetype="application/json", status=400)
        
        #can acess bookmark
        if can_view_post(post_id, self.current_user) == False:
            response_obj = {
                'message': 'You don\'t have access to post_id={0}'.format(post_id)
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=404)
       
        #save to db
        try: 
            bookmark = Bookmark(self.current_user.id, post_id)
            db.session.add(bookmark)
            db.session.commit()
        except Exception:
            return Response(json.dumps({'message': 'already been bookmarked'}), mimetype="application/json", status=400)
        return Response(json.dumps(bookmark.to_dict()), mimetype="application/json", status=201)
        
        

class BookmarkDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def delete(self, id):
        # Your code here
        if id.isnumeric() != True:
            return Response(json.dumps({'message': 'Invalid Request'}), mimetype="application/json", status=400)
        print('given id to bookmark', id)
        bookmark = Bookmark.query.filter_by(post_id=id, user_id=self.current_user.id).all()[0]
        print('bookmark', bookmark)
        if not bookmark or bookmark.user_id != self.current_user.id:
            return Response(json.dumps({'message': 'bookmark does not exist'}), mimetype="application/json", status=404)
        print("deleted bookmark ", Bookmark.query.filter_by(post_id=id, user_id=self.current_user.id).all()[0])
        Bookmark.query.filter_by(post_id=id, user_id=self.current_user.id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Bookmark on post {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        BookmarksListEndpoint, 
        '/api/bookmarks', 
        '/api/bookmarks/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )

    api.add_resource(
        BookmarkDetailEndpoint, 
        '/api/bookmarks/<id>', 
        '/api/bookmarks/<id>',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
