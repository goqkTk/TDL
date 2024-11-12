import pymysql, re, bcrypt, random, string, secrets
from datetime import datetime, timedelta

def update_categories_order(user_id, new_order):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    try:
        cursor.execute("""
            UPDATE categories 
            SET `order` = 9999
            WHERE user_id = %s
        """, (user_id,))

        for category in new_order:
            if category.get('id') is None or category.get('order') is None:
                print(f"Skipping invalid category data: {category}")
                continue
            sql = "UPDATE categories SET `order` = %s WHERE id = %s AND user_id = %s"
            cursor.execute(sql, (int(category['order']), int(category['id']), user_id))
        db.commit()
        return True
    except Exception as e:
        print(f"카테고리 순서 업데이트 오류: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()

def delete_category_db(user_id, category_id):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    try:
        sql = "UPDATE todo SET category_id = NULL WHERE category_id = %s AND user_id = %s"
        cursor.execute(sql, (category_id, user_id))
        sql = "DELETE FROM categories WHERE id = %s AND user_id = %s"
        cursor.execute(sql, (category_id, user_id))
        db.commit()
        return True
    except Exception as e:
        print(f"카테고리 삭제 오류: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()

def update_category_db(user_id, category_id, new_name):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    try:
        sql = """
        UPDATE categories 
        SET name = %s 
        WHERE id = %s AND user_id = %s
        """
        cursor.execute(sql, (new_name, category_id, user_id))
        db.commit()
        return True
    except Exception as e:
        print(f"카테고리 수정 오류: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()

def get_todos_by_search(user_id, search_term):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor(pymysql.cursors.DictCursor)
    try:
        sql = """
        SELECT id, title, detail, category_id 
        FROM todo 
        WHERE user_id = %s AND (title LIKE %s OR detail LIKE %s)
        """
        cursor.execute(sql, (user_id, f"%{search_term}%", f"%{search_term}%"))
        todos = cursor.fetchall()
        return todos
    except Exception as e:
        print(f"할 일 검색 오류: {str(e)}")
        return []
    finally:
        db.close()

def get_categories_by_search(user_id, search_term):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor(pymysql.cursors.DictCursor)
    try:
        sql = "SELECT id, name FROM categories WHERE user_id = %s AND name LIKE %s"
        cursor.execute(sql, (user_id, f"%{search_term}%"))
        categories = cursor.fetchall()
        return categories
    except Exception as e:
        print(f"카테고리 검색 오류: {str(e)}")
        return []
    finally:
        db.close()

def add_category_db(user_id, category_name):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    try:
        sql = "INSERT INTO categories (user_id, name, `order`) VALUES (%s, %s, 9999)"
        cursor.execute(sql, (user_id, category_name))
        category_id = cursor.lastrowid
        db.commit()
        success = True
    except Exception as e:
        print(f"카테고리 추가 오류: {str(e)}")
        db.rollback()
        success = False
        category_id = None
    finally:
        db.close()
    return success, category_id

def get_categories(user_id):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    try:
        sql = "SELECT id, name FROM categories WHERE user_id = %s ORDER BY `order` ASC"
        cursor.execute(sql, (user_id,))
        categories = cursor.fetchall()
        return categories
    except Exception as e:
        print(f"카테고리 조회 오류: {str(e)}")
        return []
    finally:
        db.close()

def get_category(category_id):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    try:
        sql = "SELECT id, user_id, name FROM categories WHERE id = %s"
        cursor.execute(sql, (category_id,))
        return cursor.fetchone()
    finally:
        db.close()

def get_todos_by_category(user_id, category_id):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    try:
        sql = """
        SELECT id, user_id, title, detail, favorite, day, success, 
               `order`,
               order_favorite, is_fixed, edit_day, category_id
        FROM todo 
        WHERE user_id = %s 
        AND category_id = %s 
        AND success = 0
        ORDER BY 
            is_fixed DESC,
            CASE 
                WHEN is_fixed = 1 THEN 0
                ELSE 1
            END,
            `order` ASC,
            day DESC
        """
        cursor.execute(sql, (user_id, category_id))
        todos = cursor.fetchall()
        return [dict(zip([column[0] for column in cursor.description], todo)) for todo in todos]
    finally:
        db.close()

def get_todo_without_category(user_id, completed=False):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    sql = """
    SELECT id, user_id, title, detail, favorite, day, success, 
           `order`,
           order_favorite, is_fixed, edit_day, category_id
    FROM todo 
    WHERE user_id = %s 
    AND success = %s 
    AND category_id IS NULL
    ORDER BY 
        is_fixed DESC,
        CASE 
            WHEN is_fixed = 1 THEN 0
            ELSE 1
        END,
        `order` ASC,
        day DESC
    """
    cursor.execute(sql, (user_id, 1 if completed else 0))
    result = cursor.fetchall()
    db.close()
    return result

def calculate_days_to_complete(created_at, completed_at):
    if created_at and completed_at:
        delta = completed_at.date() - created_at.date()
        return delta.days
    return None

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
        cursor.execute("""
            SELECT id 
            FROM todo 
            WHERE id = %s AND user_id = %s
        """, (todo_id, user_id))
        if not cursor.fetchone():
            return False
        sql = "UPDATE todo SET is_fixed = %s WHERE id = %s AND user_id = %s"
        cursor.execute(sql, (is_fixed, todo_id, user_id))
        db.commit()
        return True
    except Exception as e:
        print(f"할 일 고정 상태 업데이트 오류: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()

def update_todos_order(user_id, new_order, category_id=None):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    try:
        if category_id is None:
            cursor.execute("""
                UPDATE todo 
                SET `order` = 99999 
                WHERE user_id = %s AND category_id IS NULL
            """, (user_id,))
        else:
            cursor.execute("""
                UPDATE todo 
                SET `order` = 99999 
                WHERE user_id = %s AND category_id = %s
            """, (user_id, category_id))
        for todo in new_order:
            todo_id = todo['id']
            order = todo['order']
            
            if order is None:
                sql = "UPDATE todo SET `order` = NULL WHERE id = %s AND user_id = %s"
                cursor.execute(sql, (todo_id, user_id))
            else:
                sql = "UPDATE todo SET `order` = %s WHERE id = %s AND user_id = %s"
                cursor.execute(sql, (order, todo_id, user_id))
        
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

def add_todo(user_id, title, detail, category_id=None):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    try:
        current_time = datetime.now()
        if category_id is None:
            cursor.execute("""
                SELECT COALESCE(MAX(`order`), -1) 
                FROM todo 
                WHERE user_id = %s AND category_id IS NULL AND is_fixed = 0
            """, (user_id,))
        else:
            cursor.execute("""
                SELECT COALESCE(MAX(`order`), -1) 
                FROM todo 
                WHERE user_id = %s AND category_id = %s AND is_fixed = 0
            """, (user_id, category_id))
        
        max_order = cursor.fetchone()[0]
        new_order = max_order + 1 if max_order is not None else 0
        sql = """
            INSERT INTO todo 
            (user_id, title, detail, day, edit_day, category_id, `order`) 
            VALUES (%s, %s, %s, %s, NULL, %s, %s)
        """
        cursor.execute(sql, (user_id, title, detail, current_time, category_id, new_order))
        todo_id = cursor.lastrowid
        db.commit()
        sql = "SELECT * FROM todo WHERE id = %s"
        cursor.execute(sql, (todo_id,))
        new_todo = cursor.fetchone()
        
        return {
            'id': new_todo[0],
            'user_id': new_todo[1],
            'title': new_todo[2],
            'detail': new_todo[3],
            'favorite': new_todo[5],
            'day': new_todo[4],
            'success': new_todo[6],
            'order': new_order,
            'order_favorite': new_todo[8],
            'is_fixed': new_todo[10],
            'edit_day': new_todo[9],
            'category_id': new_todo[12]
        }
        
    except Exception as e:
        print(f"할 일 추가 오류: {str(e)}")
        db.rollback()
        return None
    finally:
        db.close()

def get_todo(user_id, completed=False):
    db = pymysql.connect(host='127.0.0.1', user='root', password='1234', db='TDL', charset='utf8')
    cursor = db.cursor()
    sql = f"""
    SELECT id, user_id, title, detail, favorite, day, success, `order`, order_favorite, is_fixed, edit_day, category_id
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
    try:
        sql = """
        SELECT id, user_id, title, detail, favorite, day, success, 
               `order`, order_favorite, is_fixed, edit_day, success_day 
        FROM todo 
        WHERE user_id = %s AND success = 1 
        ORDER BY success_day DESC, day DESC
        """
        cursor.execute(sql, (user_id,))
        result = cursor.fetchall()
        return result
    except Exception as e:
        print(f"완료된 할 일 조회 오류: {str(e)}")
        return []
    finally:
        db.close()

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