from flask import *
from flask_mail import Mail, Message
from mysql import *
from datetime import timedelta
from werkzeug.utils import secure_filename
import bcrypt, os, tempfile, traceback, logging

app = Flask(__name__)
app.secret_key = 'D324F0D74B242A246857E8BF1DEAA2C92B2BE926C0ED1CD2C099A0DB3547BF8C'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'tdlhelp02@gmail.com'
app.config['MAIL_PASSWORD'] = 'ivfg ftay ddel oqoc'
app.config['MAIL_DEFAULT_SENDER'] = 'tdlhelp02@gmail.com'
admin_email = 'tdlhelp02@gmail.com'
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

mail = Mail(app)

verify_code_html = """
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>비밀번호 재설정 인증 코드</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.4; color: #333; margin: 0; padding: 0; background-color: #ffffff;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
            <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border: 1px solid #ddd; border-radius: 5px;">
                    <tr>
                        <td style="padding: 20px;">
                            <p style="text-align: center; font-size: 18px; margin: 0 0 10px;">TDL</p>
                            <h1 style="color: #4285F4; margin: 0 0 15px; text-align: center; font-size: 24px;">비밀번호 재설정 인증 코드</h1>
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
                            <p style="font-size: 16px; margin: 0 0 10px;">귀하의 계정에 대한 비밀번호 재설정 요청을 받았습니다.</p>
                            <p style="font-size: 16px; margin: 0 0 10px;">이 코드를 사용하여 비밀번호를 변경하세요.</p>
                            <div style="background-color: #4285F4; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 15px; margin: 20px 0;">
                                {{ verification_code }}
                            </div>
                            <p style="font-size: 16px; margin: 0 0 10px;">이 코드는 10분 뒤에 만료됩니다.</p>
                            <p style="font-size: 16px; margin: 0;">본인이 요청하지 않았다면 이 이메일을 무시하셔도 됩니다.</p>
                        </td>
                    </tr>
                </table>
                <p style="text-align: center; font-size: 12px; color: #777; margin-top: 10px;">
                    © 2024 TDL. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
"""

help_html = """
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TDL 문의 내용</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.4; color: #333; margin: 0; padding: 0; background-color: #ffffff;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
            <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border: 1px solid #ddd; border-radius: 5px;">
                    <tr>
                        <td style="padding: 20px;">
                            <p style="text-align: center; font-size: 18px; margin: 0 0 10px;">TDL</p>
                            <h1 style="color: #4285F4; margin: 0 0 15px; text-align: center; font-size: 24px;">문의</h1>
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
                            <p><strong>문의 유형:</strong> {{ type }}</p>
                            <p><strong>보낸 사람:</strong> {{ sender_email }}</p>
                            <pre>{{ content }}</pre>
                        </td>
                    </tr>
                </table>
                <p style="text-align: center; font-size: 12px; color: #777; margin-top: 10px;">
                    © 2024 TDL. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
"""

register_html = """
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>이메일 인증</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
        <p style="text-align: center; font-size: 18px; margin: 0 0 10px;">TDL</p>
        <h1 style="color: #4285F4; margin: 0 0 15px; text-align: center; font-size: 24px;">이메일 인증</h1>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
        <p>안녕하세요,</p>
        <p>TDL을 이용해 주셔서 진심으로 감사합니다<br>아래 버튼을 클릭하여 회원가입을 완료하세요</p>
        <div style="margin-top: 20px;">
            <a href="{{ verification_link }}" style="background-color: #4285F4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">이메일 인증</a>
        </div>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd; margin: 15px 0;">
        <p style="margin-top: 20px;">10분 동안 유효하며,<br>버튼이 작동하지 않을 경우 아래 링크로 접속해주세요</p>
        <p style="color: gray;">{{ verification_link }}</p>
    </div>
</body>
</html>
"""

@app.route('/', methods=['GET', 'POST'])
def main():
    user_id = session.get('user_id')
    todo = get_todo_without_category(user_id, completed=False) if user_id else []
    completed = get_todo_without_category(user_id, completed=True) if user_id else []
    categories = get_categories(user_id) if user_id else []
    is_todo_empty = len(todo) == 0
    return render_template('main/main.html', user_id=user_id, todo=todo, completed=completed, categories=categories, datetime=datetime, is_todo_empty=is_todo_empty)

@app.route('/delete_category', methods=['POST'])
def delete_category():
    data = request.json
    category_id = data.get('category_id')
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({'success': False, 'message': '로그인이 필요합니다.'})

    success = delete_category_db(user_id, category_id)
    if success:
        return jsonify({'success': True, 'message': '카테고리가 삭제되었습니다.'})
    else:
        return jsonify({'success': False, 'message': '카테고리 삭제에 실패했습니다.'})

@app.route('/update_category', methods=['POST'])
def update_category():
    data = request.json
    new_name = data.get('category_name')
    category_id = data.get('category_id')
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({'success': False, 'message': '로그인이 필요합니다.'})

    if not new_name:
        return jsonify({'success': False, 'message': '카테고리 이름을 입력해주세요.'})

    success = update_category_db(user_id, category_id, new_name)
    if success:
        return jsonify({'success': True, 'message': '카테고리가 수정되었습니다.'})
    else:
        return jsonify({'success': False, 'message': '카테고리 수정에 실패했습니다.'})

@app.route('/check_login')
def check_login():
    return jsonify({'logged_in': 'user_id' in session})

@app.route('/search', methods=['POST'])
def search():
    data = request.json
    search_term = data.get('search_term', '')
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'categories': [], 'todos': []})
    
    categories = get_categories_by_search(user_id, search_term)
    todos = get_todos_by_search(user_id, search_term)
    categories = [{'id': cat['id'], 'name': cat['name']} for cat in categories]
    
    return jsonify({'categories': categories, 'todos': todos})

@app.route('/add_category', methods=['POST'])
def add_category():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': '로그인이 필요합니다.'})

    data = request.json
    category_name = data.get('category_name')

    if not category_name:
        return jsonify({'success': False, 'message': '카테고리 이름을 입력해주세요.'})

    success, category_id = add_category_db(user_id, category_name)
    if success:
        return jsonify({'success': True, 'message': '카테고리가 추가되었습니다.', 'category_id': category_id})
    else:
        return jsonify({'success': False, 'message': '카테고리 추가에 실패했습니다.'})

@app.route('/category/<int:category_id>', methods=['GET'])
def category_page(category_id):
    user_id = session.get('user_id')
    if not user_id:
        return redirect('/login')
    
    category = get_category(category_id)
    if not category or category[1] != user_id:
        return redirect('/')
    
    todos = get_todos_by_category(user_id, category_id)
    categories = get_categories(user_id)
    
    return render_template('category.html', user_id=user_id, category=category, todos=todos, categories=categories, datetime=datetime, category_id=category_id)

@app.route('/add_todo', methods=['POST'])
def add_todo_route():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': '로그인이 필요합니다.'})

    data = request.json
    title = data.get('title')
    detail = data.get('detail')
    category_id = data.get('category_id')

    if not title:
        return jsonify({'success': False, 'message': '제목을 입력해주세요.'})

    new_todo = add_todo(user_id, title, detail, category_id)
    if new_todo:
        if isinstance(new_todo['day'], datetime):
            new_todo['day'] = new_todo['day'].isoformat()
        if isinstance(new_todo['edit_day'], datetime):
            new_todo['edit_day'] = new_todo['edit_day'].isoformat() if new_todo['edit_day'] else None
        
        return jsonify({'success': True, 'message': '할 일이 추가되었습니다.', 'todo': new_todo})
    else:
        return jsonify({'success': False, 'message': '할 일 추가에 실패했습니다.'})

@app.route('/update_todo_order', methods=['POST'])
def update_todo_order():
    try:
        data = request.json
        new_order = data['order']
        category_id = data.get('category_id')
        user_id = session.get('user_id')
        
        if not user_id:
            return jsonify({'success': False, 'message': '로그인이 필요합니다.'})
            
        success = update_todos_order(user_id, new_order, category_id)
        if success:
            return jsonify({'success': True, 'message': '할 일 순서가 업데이트되었습니다.'})
        else:
            return jsonify({'success': False, 'message': '할 일 순서 업데이트에 실패했습니다.'})
    except Exception as e:
        print(f"Error in update_todo_order: {str(e)}")
        return jsonify({'success': False, 'message': '서버 오류가 발생했습니다.'})

@app.route('/update_favorite_order', methods=['POST'])
def update_favorite_order():
    data = request.json
    new_order = data['order']
    user_id = session.get('user_id')
    success = update_favorites_order(user_id, new_order)
    if success:
        return jsonify({'success': True, 'message': '즐겨찾기 순서가 업데이트되었습니다.'})
    else:
        return jsonify({'success': False, 'message': '즐겨찾기 순서 업데이트에 실패했습니다.'})

@app.route('/success', methods=['GET'])
def success():
    user_id = session.get('user_id')
    todos = get_completed_todos(user_id)
    todos_with_info = []
    categories = get_categories(user_id) if user_id else []
    for todo in todos:
        days = (todo[11] - todo[5]).days if todo[11] and todo[5] else None
        weeks = days // 7 if days is not None else None
        todos_with_info.append(todo + (days, weeks))
    return render_template('main/success.html', user_id=user_id, todo=todos_with_info, categories=categories)

@app.route('/favorite', methods=['GET', 'POST'])
def favorite():
    user_id = session.get('user_id')
    todo = get_favorite(user_id)
    categories = get_categories(user_id) if user_id else []
    return render_template('main/favorite.html', user_id=user_id, todo=todo, categories=categories)

@app.route('/update_todo', methods=['POST'])
def update_todo():
    data = request.json
    todo_id = data['todo_id']
    title = data['title']
    detail = data['detail']
    success, updated_todo = update_todo_db(todo_id, title, detail)
    if success and updated_todo:
        response_data = {
            'success': True,
            'title': updated_todo[2],
            'detail': updated_todo[3],
            'created_at': updated_todo[4].strftime('%Y년 %m월 %d일 %H:%M:%S') if updated_todo[4] else '정보 없음',
            'updated_at': updated_todo[9].strftime('%Y년 %m월 %d일 %H:%M:%S') if updated_todo[9] else '수정되지 않음'
        }
        return jsonify(response_data)
    else:
        return jsonify({'success': False, 'message': '할 일 수정에 실패했습니다.'}), 400

@app.route('/update_category_order', methods=['POST'])
def update_category_order():
    data = request.json
    new_order = data['order']
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'success': False, 'message': '로그인이 필요합니다.'})
    success = update_categories_order(user_id, new_order)
    if success:
        return jsonify({'success': True, 'message': '카테고리 순서가 업데이트되었습니다.'})
    else:
        return jsonify({'success': False, 'message': '카테고리 순서 업데이트에 실패했습니다.'})

@app.route('/update_fix', methods=['POST'])
def update_fix():
    data = request.json
    todo_id = data.get('todo_id')
    is_fixed = data.get('is_fixed')
    user_id = session.get('user_id')

    print(f"Received request - todo_id: {todo_id}, is_fixed: {is_fixed}, user_id: {user_id}")  # 디버깅용

    if todo_id is None or is_fixed is None or user_id is None:
        return jsonify({"success": False, "message": "Invalid data"}), 400

    success = update_todo_fix(user_id, todo_id, is_fixed)
    if success:
        return jsonify({"success": True, "message": "Todo fix status updated successfully"}), 200
    else:
        return jsonify({"success": False, "message": "Failed to update todo fix status"}), 500

@app.route('/delete_todo', methods=['POST'])
def delete_todo():
    data = request.json
    todo_id = data['todo_id']
    success = delete_todo_db(todo_id)
    return jsonify({'success': success})

@app.route('/update_favorite', methods=['POST'])
def update_favorite():
    data = request.json
    todo_id = data['todo_id']
    is_favorite = data['is_favorite']
    success = update_todo_favorite(todo_id, is_favorite)
    return jsonify({'success': success})

@app.route('/update_success', methods=['POST'])
def update_success():
    data = request.json
    todo_id = data['todo_id']
    is_success = data['is_success']
    success = update_todo_success(todo_id, is_success)
    return jsonify({'success': success})

@app.route('/get_completed_todos')
def get_completed_todos_route():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': '로그인이 필요합니다.', 'todos': []})
    
    todos = get_completed_todos(user_id)
    todos_list = []
    
    for todo in todos:
        todo_dict = {
            'id': todo[0],
            'user_id': todo[1],
            'title': todo[2],
            'detail': todo[3],
            'favorite': todo[4],
            'day': todo[5].isoformat() if todo[5] else None,
            'success': todo[6],
            'order': todo[7],
            'order_favorite': todo[8],
            'is_fixed': todo[9],
            'edit_day': todo[10].isoformat() if todo[10] else None,
            'success_day': todo[11].isoformat() if todo[11] else None
        }
        todos_list.append(todo_dict)
    
    return jsonify({
        'success': True,
        'todos': todos_list
    })

@app.route('/calendar', methods=['GET', 'POST'])
def calendar():
    user_id = session.get('user_id')
    if user_id == 'Admin':
        return render_template('calendar.html', user_id=user_id)
    return render_template('comingsoon.html', user_id=user_id)

@app.route('/save_event', methods=['POST'])
def save_event():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': '로그인이 필요합니다.'})
    
    try:
        data = request.json
        db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
        
        event_data = {
            'user_id': user_id,
            'title': data.get('title'),
            'start_datetime': data.get('startDateTime'),
            'end_datetime': data.get('endDateTime'),
            'notification': data.get('notification'),
            'url': data.get('url'),
            'memo': data.get('memo')
        }
        
        success, event_id = save_calendar_event(db, event_data)
        db.close()
        
        if success:
            return jsonify({
                'success': True,
                'message': '일정이 저장되었습니다.',
                'event_id': event_id
            })
        else:
            return jsonify({
                'success': False,
                'message': '일정 저장에 실패했습니다.'
            })
            
    except Exception as e:
        print(f"일정 저장 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': '일정 저장 중 오류가 발생했습니다.'
        })

@app.route('/get_events')
def get_events():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': '로그인이 필요합니다.', 'events': []})
    
    start_date = request.args.get('start')
    end_date = request.args.get('end')
    
    try:
        db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
        events = get_calendar_events(db, user_id, start_date, end_date)
        db.close()
        
        for event in events:
            if isinstance(event['start_datetime'], datetime):
                event['start_datetime'] = event['start_datetime'].isoformat()
            if isinstance(event['end_datetime'], datetime):
                event['end_datetime'] = event['end_datetime'].isoformat()
                
        return jsonify({
            'success': True,
            'events': events
        })
    except Exception as e:
        print(f"이벤트 조회 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': '이벤트 조회에 실패했습니다.',
            'events': []
        })

@app.route('/delete_event', methods=['POST'])
def delete_event():
    try:
        data = request.json
        event_id = data.get('eventId')
        if not event_id:
            return jsonify({'success': False, 'message': '일정 ID가 필요합니다.'})
            
        db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
        cursor = db.cursor()
        
        sql = "DELETE FROM calendar_events WHERE id = %s"
        cursor.execute(sql, (event_id,))
        db.commit()
        
        return jsonify({'success': True, 'message': '일정이 삭제되었습니다.'})
    except Exception as e:
        print(f"일정 삭제 오류: {str(e)}")
        return jsonify({'success': False, 'message': '일정 삭제에 실패했습니다.'})
    finally:
        db.close()

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/help', methods=['GET', 'POST'])
def help():
    user_id = session.get('user_id')
    return render_template('help.html', user_id=user_id)

@app.route('/send_help', methods=['POST'])
def send_help():
    type = request.form['type']
    content = request.form['content']
    user_id = session.get('user_id')
    if user_id:
        user_email = get_user_email(user_id)
        sender_email = user_email if user_email else '로그인하지 않은 사용자'
    else:
        sender_email = '로그인하지 않은 사용자'
    try:
        msg = Message(f"TDL 문의: {type}",
                      sender=sender_email,
                      recipients=[admin_email])
        
        msg.html = render_template_string(help_html,
                                          type=type,
                                          sender_email=sender_email,
                                          content=content)
        msg.body = f"문의 유형: {type}\n보낸 사람: {sender_email}\n\n문의 내용:\n{content}"

        with tempfile.TemporaryDirectory() as temp_dir:
            for file in request.files.getlist('images'):
                if file and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    filepath = os.path.join(temp_dir, filename)
                    file.save(filepath)
                    with open(filepath, 'rb') as fp:
                        msg.attach(filename, "image/jpeg", fp.read())
                else:
                    return jsonify({'success': False, 'message': '지원되지 않는 파일 형식입니다. png, jpg, jpeg, gif 확장자만 허용됩니다.'})
        mail.send(msg)
        return jsonify({'success': True, 'message': '문의가 등록됐습니다'})
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return jsonify({'success': False, 'message': '문의를 등록하지 못했습니다. 다시 시도해주세요'})

@app.route('/account', methods=['GET', 'POST'])
def account():
    user_id = session.get('user_id')
    if 'user_id' in session:
        user_email = get_user_email(user_id)
        return render_template('account.html', user_id=user_id, user_email=user_email)
    else:
        return redirect('/login')

@app.route('/update_id', methods=['POST'])
def update_id():
    data = request.json
    current_id = session.get('user_id')
    new_id = data.get('new_id')
    
    if not current_id:
        return jsonify({'success': False, 'message': '로그인이 필요합니다.'})
        
    if not new_id:
        return jsonify({'success': False, 'message': '새 아이디를 입력해주세요.'})
    
    if not duplicate_check(new_id):
        return jsonify({'success': False, 'message': '이미 사용 중인 아이디입니다.'})
        
    if update_user_id(current_id, new_id):
        session['user_id'] = new_id
        return jsonify({'success': True, 'message': '아이디가 변경되었습니다.'})
    else:
        return jsonify({'success': False, 'message': '아이디 변경에 실패했습니다.'})
    
@app.route('/update_password', methods=['POST'])
def update_password():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': '로그인이 필요합니다.'})
    
    data = request.json
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        return jsonify({'success': False, 'message': '모든 필드를 입력해주세요.'})
    
    user = get_user_by_id_or_email(session['user_id'])
    if not user or not verify_password(user['pw'], current_password):
        return jsonify({'success': False, 'message': '현재 비밀번호가 일치하지 않습니다.'})
    
    try:
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        update_user_password(session['user_id'], hashed_password)
        return jsonify({'success': True, 'message': '비밀번호가 변경되었습니다.'})
    except Exception as e:
        print(f"비밀번호 변경 오류: {str(e)}")
        return jsonify({'success': False, 'message': '비밀번호 변경에 실패했습니다.'})

@app.route('/delete_account', methods=['POST'])
def delete_account():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': '로그인이 필요합니다.'})
    
    try:
        db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
        cursor = db.cursor()
        cursor.execute("DELETE FROM todo WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM categories WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM calendar_events WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM account WHERE id = %s", (user_id,))
        db.commit()
        db.close()
        session.clear()
        return jsonify({'success': True, 'message': '계정이 삭제되었습니다.'})
    except Exception as e:
        print(f"계정 삭제 오류: {str(e)}")
        return jsonify({'success': False, 'message': '계정 삭제에 실패했습니다.'})

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.clear()
    session.permanent = False
    return redirect('/')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        identifier = request.form['id']
        password = request.form['pw']
        remember = request.form.get('autologin') == 'on'
        user = get_user_by_id_or_email(identifier)
        
        if user and verify_password(user['pw'], password):
            session['user_id'] = user['id']
            if remember:
                session.permanent = True
            else:
                session.permanent = False
            return jsonify({"success": True})
        else:
            return jsonify({"success": False})
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        id = request.form['id']
        email = request.form['email-name'] + '@' + request.form['email-domain']
        password = request.form['pw']
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        try:
            insert_user(id, hashed_password, email)
            return jsonify({"success": True, "message": "회원가입이 완료되었습니다."})
        except Exception as e:
            return jsonify({"success": False, "message": f"Error: {str(e)}"})
    return render_template('register.html')

@app.route('/send_register', methods=['POST'])
def send_register():
    email = request.form['email']
    token = generate_token()
    verification_link = url_for('verify_email', token=token, _external=True)
    
    try:
        msg = Message("이메일 인증", sender='tdlhelp02@gmail.com', recipients=[email])
        msg.html = render_template_string(register_html, verification_link=verification_link)
        mail.send(msg)
        insert_token(email, token)
        return jsonify({'success': True, 'message': '인증 이메일이 전송되었습니다'})
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return jsonify({'success': False, 'message': '이메일 전송에 실패했습니다. 다시 시도해주세요'})

@app.route('/verify_email/<token>')
def verify_email(token):
    if verify_token(token):
        return render_template('email_stat/email_verified.html')
    else:
        return render_template('email_stat/email_verified_fail.html'), 400

@app.route('/check_email_verification', methods=['POST'])
def check_email_verification():
    email = request.json['email']
    verification_status = check_email_verification_status(email)
    if verification_status:
        return jsonify({'verified': True})
    else:
        return jsonify({'verified': False})

@app.route('/check_id', methods=['POST'])
def check_id():
    id = request.form['id']
    is_unique = duplicate_check(id)
    return jsonify({'is_unique': is_unique})

@app.route('/check_email', methods=['POST'])
def check_email():
    email = request.form.get('email')
    if is_valid_email(email):
        if email_duplicate_check(email):
            return jsonify({'valid': False, 'message': '이미 존재하는 이메일입니다'})
        else:
            return jsonify({'valid': True})
    else:
        return jsonify({'valid': False, 'message': '유효하지 않은 이메일입니다'})

@app.route('/forgot', methods=['GET', 'POST'])
def forgot():
    return render_template('forgot.html')

@app.route('/check_id_or_email', methods=['POST'])
def check_id_or_email():
    data = request.json
    identifier = data['identifier']
    user = get_user_by_id_or_email(identifier)
    if user:
        return jsonify({'exists': True})
    return jsonify({'exists': False})

@app.route('/send_verification_code', methods=['POST'])
def send_verification_code():
    data = request.json
    email = data['email']
    verification_code = generate_verification_code()
    try:
        msg = Message("비밀번호 재설정 인증 코드", sender='noreply@example.com', recipients=[email])
        msg.html = render_template_string(verify_code_html, verification_code=verification_code)
        mail.send(msg)
        insert_verification_code(email, verification_code)
        return jsonify({'success': True, 'message': '인증 코드가 전송되었습니다'})
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return jsonify({'success': False, 'message': '인증 코드 전송에 실패했습니다. 다시 시도해주세요'})

@app.route('/verify_code', methods=['POST'])
def verify_code():
    data = request.json
    email = data['email']
    code = data['code']
    if verify_code(email, code):
        mark_code_as_used(email, code)
        return jsonify({'success': True, 'message': '인증 성공. 비밀번호를 재설정하세요'})
    else:
        return jsonify({'success': False, 'message': '잘못된 인증 코드이거나 만료되었습니다'})

@app.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.json
    identifier = data['identifier']
    new_password = data['new_password']

    user = get_user_by_id_or_email(identifier)
    if not user:
        return jsonify({'success': False, 'message': '사용자를 찾을 수 없습니다.'})
    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    try:
        update_user_password(user['id'], hashed_password)
        return jsonify({'success': True, 'message': '비밀번호가 성공적으로 변경되었습니다.'})
    except Exception as e:
        print(f"Error updating password: {str(e)}")
        return jsonify({'success': False, 'message': '비밀번호 변경에 실패했습니다.'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=1000, debug=True)