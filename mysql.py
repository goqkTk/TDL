import pymysql, re, bcrypt, random, string, secrets
from datetime import datetime, timedelta

def get_todo_by_id(todo_id):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    try:
        cursor.execute("SELECT * FROM todo WHERE id = %s", (todo_id,))
        todo = cursor.fetchone()
    finally:
        db.close()
    return todo

def update_todo_fix(user_id, todo_id, is_fixed):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    try:
        cursor.execute("SELECT `order` FROM todo WHERE id = %s AND user_id = %s", (todo_id, user_id))
        result = cursor.fetchone()
        original_order = result[0] if result else None

        if is_fixed:
            sql = "UPDATE todo SET `order` = NULL, is_fixed = TRUE WHERE id = %s AND user_id = %s"
            cursor.execute(sql, (todo_id, user_id))
        else:
            sql = """
            UPDATE todo 
            SET `order` = (
                SELECT min_order - 1
                FROM (
                    SELECT COALESCE(MIN(`order`), 0) as min_order 
                    FROM todo 
                    WHERE user_id = %s AND `order` IS NOT NULL AND is_fixed = FALSE
                ) AS subquery
            ),
            is_fixed = FALSE
            WHERE id = %s AND user_id = %s
            """
            cursor.execute(sql, (user_id, todo_id, user_id))
        
        db.commit()
        return True, original_order
    except Exception as e:
        print(f"할 일 고정 상태 업데이트 오류: {str(e)}")
        db.rollback()
        return False, None
    finally:
        db.close()

def update_todos_order(user_id, new_order):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    try:
        for index, todo in enumerate(new_order):
            todo_id = todo['id']
            new_order = todo['order']
            if new_order is None:
                sql = "UPDATE todo SET `order` = NULL WHERE id = %s AND user_id = %s"
            else:
                sql = "UPDATE todo SET `order` = %s WHERE id = %s AND user_id = %s"
            cursor.execute(sql, (new_order, todo_id, user_id) if new_order is not None else (todo_id, user_id))
        db.commit()
        return True
    except Exception as e:
        print(f"할 일 순서 업데이트 오류: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()

def update_favorites_order(user_id, new_order):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    try:
        for index, todo_id in enumerate(new_order):
            sql = "UPDATE todo SET `order_favorite` = %s WHERE id = %s AND user_id = %s AND favorite = 1"
            cursor.execute(sql, (index, todo_id, user_id))
        db.commit()
        success = True
    except Exception as e:
        print(f"즐겨찾기 순서 업데이트 오류: {str(e)}")
        db.rollback()
        success = False
    finally:
        db.close()
    return success

def add_todo(user_id, title, detail):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    try:
        current_time = datetime.now()
        sql = "INSERT INTO todo (user_id, title, detail, day, edit_day) VALUES (%s, %s, %s, %s, NULL)"
        cursor.execute(sql, (user_id, title, detail, current_time))
        db.commit()
        success = True
    except Exception as e:
        print(f"할 일 추가 오류: {str(e)}")
        db.rollback()
        success = False
    finally:
        db.close()
    return success

def get_todo(user_id, completed=False):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    sql = f"""
    SELECT id, user_id, title, detail, favorite, day, success, `order`, order_favorite, is_fixed, edit_day
    FROM todo 
    WHERE user_id = %s AND success = %s 
    ORDER BY 
        is_fixed DESC,
        CASE 
            WHEN is_fixed = 1 THEN `order`
            ELSE 9999
        END ASC,
        CASE 
            WHEN is_fixed = 0 THEN `order`
            ELSE 9999
        END ASC
    """
    cursor.execute(sql, (user_id, 1 if completed else 0))
    result = cursor.fetchall()
    db.close()
    return result

def get_favorite(user_id):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    sql = """
    SELECT id, user_id, title, detail, favorite, day 
    FROM todo 
    WHERE user_id = %s AND favorite = 1 AND success = 0
    ORDER BY `order_favorite` ASC
    """
    cursor.execute(sql, (user_id,))
    result = cursor.fetchall()
    db.close()
    return result

def update_todo_db(todo_id, title, detail):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    try:
        current_time = datetime.now()
        sql = "UPDATE todo SET title = %s, detail = %s, edit_day = %s WHERE id = %s"
        cursor.execute(sql, (title, detail, current_time, todo_id))
        db.commit()
        cursor.execute("SELECT id, user_id, title, detail, day, success, favorite, `order`, order_favorite, edit_day, is_fixed FROM todo WHERE id = %s", (todo_id,))
        updated_todo = cursor.fetchone()
        success = True
    except Exception as e:
        db.rollback()
        success = False
        updated_todo = None
    finally:
        db.close()
    return success, updated_todo

def delete_todo_db(todo_id):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    try:
        sql = "DELETE FROM todo WHERE id = %s"
        cursor.execute(sql, (todo_id,))
        db.commit()
        success = True
    except Exception as e:
        print(f"할 일 삭제 오류: {str(e)}")
        db.rollback()
        success = False
    finally:
        db.close()
    return success

def update_todo_favorite(todo_id, is_favorite):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    try:
        if is_favorite:
            sql = """
            UPDATE todo 
            SET favorite = 1, 
                order_favorite = (SELECT MAX(COALESCE(t.order_favorite, -1)) + 1 FROM (SELECT * FROM todo) AS t WHERE t.user_id = todo.user_id AND t.favorite = 1)
            WHERE id = %s
            """
        else:
            sql = "UPDATE todo SET favorite = 0, order_favorite = 9999 WHERE id = %s"
        cursor.execute(sql, (todo_id,))
        db.commit()
        success = True
    except Exception as e:
        print(f"즐겨찾기 상태 업데이트 오류: {str(e)}")
        db.rollback()
        success = False
    finally:
        db.close()
    return success

def update_todo_success(todo_id, is_success):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    try:
        if is_success:
            sql = "UPDATE todo SET success = %s, success_day = NOW() WHERE id = %s"
        else:
            sql = "UPDATE todo SET success = %s, success_day = NULL WHERE id = %s"
        cursor.execute(sql, (1 if is_success else 0, todo_id))
        db.commit()
        success = True
    except Exception as e:
        print(f"완료 상태 업데이트 오류: {str(e)}")
        db.rollback()
        success = False
    finally:
        db.close()
    return success

def get_completed_todos(user_id):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    sql = "SELECT id, user_id, title, detail, favorite, day, success, `order`, order_favorite, is_fixed, edit_day, success_day FROM todo WHERE user_id = %s AND success = 1"
    cursor.execute(sql, (user_id,))
    result = cursor.fetchall()
    db.close()
    return result

def duplicate_check(id):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    sql = f"select id from account where id = '{id}'"
    cursor.execute(sql)
    result = cursor.fetchone()
    db.close()
    if result:
        return False
    else:
        return True

def email_duplicate_check(email):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    sql = f"SELECT email FROM account WHERE email = '{email}'"
    cursor.execute(sql)
    result = cursor.fetchone()
    db.close()
    return result is not None

def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def insert_user(id, hashed_password, email):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    sql = "INSERT INTO account (id, pw, email) VALUES (%s, %s, %s)"
    cursor.execute(sql, (id, hashed_password, email))
    db.commit()
    db.close()

def get_user_by_id_or_email(identifier):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor(pymysql.cursors.DictCursor)
    sql = "SELECT * FROM account WHERE id = %s OR email = %s"
    cursor.execute(sql, (identifier, identifier))
    result = cursor.fetchone()
    db.close()
    return result

def verify_password(stored_password, provided_password):
    return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password.encode('utf-8'))

def generate_verification_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def insert_verification_code(user_id, code):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    expires_at = datetime.now() + timedelta(minutes=10)
    sql = "INSERT INTO verification_codes (user_id, code, expires_at) VALUES (%s, %s, %s)"
    cursor.execute(sql, (user_id, code, expires_at))
    db.commit()
    db.close()

def verify_code(user_id, code):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    sql = """
    SELECT * FROM verification_codes 
    WHERE user_id = %s AND code = %s AND expires_at > NOW() AND is_used = FALSE
    ORDER BY created_at DESC LIMIT 1
    """
    cursor.execute(sql, (user_id, code))
    result = cursor.fetchone()
    db.close()
    return result is not None

def mark_code_as_used(user_id, code):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    sql = "UPDATE verification_codes SET is_used = TRUE WHERE user_id = %s AND code = %s"
    cursor.execute(sql, (user_id, code))
    db.commit()
    db.close()

def update_user_password(user_id, hashed_password):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    sql = f"UPDATE account SET pw = %s WHERE id = %s"
    cursor.execute(sql, (hashed_password, user_id))
    db.commit()
    db.close()

def get_user_email(user_id):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    sql = "SELECT email FROM account WHERE id = %s"
    cursor.execute(sql, (user_id,))
    result = cursor.fetchone()
    db.close()
    if result:
        return result[0]
    else:
        return None

def generate_token():
    return secrets.token_urlsafe(32)

def insert_token(email, token):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    sql = "INSERT INTO email_verifications (email, token) VALUES (%s, %s)"
    cursor.execute(sql, (email, token))
    db.commit()
    db.close()

def verify_token(token):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    sql = """
    SELECT * FROM email_verifications 
    WHERE token = %s AND expires_at > NOW() AND used = FALSE
    ORDER BY created_at DESC LIMIT 1
    """
    cursor.execute(sql, (token,))
    result = cursor.fetchone()
    if result:
        sql = "UPDATE email_verifications SET used = TRUE WHERE token = %s"
        cursor.execute(sql, (token,))
        db.commit()
    db.close()
    return result is not None

def check_email_verification_status(email):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    sql = """
    SELECT used FROM email_verifications 
    WHERE email = %s
    ORDER BY created_at DESC LIMIT 1
    """
    cursor.execute(sql, (email,))
    result = cursor.fetchone()
    db.close()
    return result is not False and result[0] == True