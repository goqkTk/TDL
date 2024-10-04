from flask import *
from flask_mail import Mail, Message
from mysql import *
from datetime import timedelta
from werkzeug.utils import secure_filename
import bcrypt, os, tempfile

app = Flask(__name__)
app.secret_key = 'D324F0D74B242A246857E8BF1DEAA2C92B2BE926C0ED1CD2C099A0DB3547BF8C'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'tdlhelp02@gmail.com'
app.config['MAIL_PASSWORD'] = 'kbry bbmh mpwk bjun'
app.config['MAIL_DEFAULT_SENDER'] = 'tdlhelp02@gmail.com'
admin_email = 'tdlhelp02@gmail.com'

#app.config['MAIL_USERNAME'] = 'tdlhelp01@gmail.com'
#app.config['MAIL_PASSWORD'] = 'mdmr nzqb amyj tekx'
#app.config['MAIL_DEFAULT_SENDER'] = 'tdlhelp01@gmail.com'
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
    todo = get_todo(user_id, completed=False) if user_id else []
    completed = get_todo(user_id, completed=True) if user_id else []
    return render_template('main/main.html', user_id=user_id, todo=todo, completed=completed, datetime=datetime)

@app.route('/add_todo', methods=['POST'])
def add_todo_route():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': '로그인이 필요합니다.'})

    data = request.json
    title = data.get('title')
    detail = data.get('detail')

    if not title:
        return jsonify({'success': False, 'message': '제목을 입력해주세요.'})

    success = add_todo(user_id, title, detail)
    if success:
        return jsonify({'success': True, 'message': '할 일이 추가되었습니다.'})
    else:
        return jsonify({'success': False, 'message': '할 일 추가에 실패했습니다.'})

@app.route('/update_todo_order', methods=['POST'])
def update_todo_order():
    data = request.json
    new_order = data['order']
    user_id = session.get('user_id')
    success = update_todos_order(user_id, new_order)
    if success:
        return jsonify({'success': True, 'message': '할 일 순서가 업데이트되었습니다.'})
    else:
        return jsonify({'success': False, 'message': '할 일 순서 업데이트에 실패했습니다.'})

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
    completed_todos = get_completed_todos(user_id) if user_id else []
    return render_template('main/success.html', user_id=user_id, todo=completed_todos)

@app.route('/favorite', methods=['GET', 'POST'])
def favorite():
    user_id = session.get('user_id')
    todo = get_favorite(user_id)
    return render_template('main/favorite.html', user_id=user_id, todo=todo)

@app.route('/update_todo', methods=['POST'])
def update_todo():
    data = request.json
    todo_id = data['todo_id']
    title = data['title']
    detail = data['detail']
    success, updated_todo = update_todo_db(todo_id, title, detail)
    if success and updated_todo:
        return jsonify({
            'success': True, 
            'todo': {
                'id': updated_todo[0],
                'title': updated_todo[2],
                'detail': updated_todo[3],
                'day': updated_todo[5].strftime('%Y년 %m월 %d일 %H:%M:%S') if updated_todo[5] else None,
                'edit_day': updated_todo[10].strftime('%Y년 %m월 %d일 %H:%M:%S') if updated_todo[10] else None
            }
        })
    else:
        return jsonify({'success': False})

@app.route('/update_fix', methods=['POST'])
def update_fix():
    data = request.json
    todo_id = data.get('todo_id')
    is_fixed = data.get('is_fixed')
    user_id = session.get('user_id')

    if todo_id is None or is_fixed is None or user_id is None:
        return jsonify({"success": False, "message": "Invalid data"}), 400

    success, original_order = update_todo_fix(user_id, todo_id, is_fixed)
    if success:
        return jsonify({"success": True, "message": "Todo fix status updated successfully", "original_order": original_order}), 200
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

@app.route('/calendar', methods=['GET', 'POST'])
def calendar():
    user_id = session.get('user_id')
    return render_template('calendar.html', user_id=user_id)

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
        return render_template('account.html', user_id=user_id)
    else:
        return redirect('/login')

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
        msg = Message("이메일 인증", sender='noreply@example.com', recipients=[email])
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
        return jsonify({'exists': True, 'email': user['email']})
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