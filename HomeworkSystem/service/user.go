package service

import (
	"errors"

	"github.com/xieyuxuan109/homeworksystem/configs"
	"github.com/xieyuxuan109/homeworksystem/dao"
	"github.com/xieyuxuan109/homeworksystem/model"
	"github.com/xieyuxuan109/homeworksystem/pkg"
)

func Register(req model.UserRegisterRequest) (*model.UserResponse, error) {
	exists := dao.UserExist(req.Username)
	if exists {
		return nil, errors.New("用户已存在")
	}
	user := model.User{
		Username: req.Username,
		Nickname: req.Nickname,
		Subject:  req.Subject,
		Role:     req.Role,
	}
	if user.Subject == "" {
		user.Subject = req.Department
	}
	if model.GetSubjectLabel(user.Subject) == "" {
		return nil, errors.New("学科不合法")
	}
	if user.Role == "admin" {
		user.Role = "teacher"
	}
	if user.Role != "student" && user.Role != "teacher" {
		return nil, errors.New("角色仅支持 student 或 teacher")
	}
	pkg.SetPassword(&user, req.Password)
	err := dao.Add(user)
	if err != nil {
		return nil, err
	}
	userExist, err := dao.Search(user.Username)
	if err != nil {
		return nil, err
	}
	res := userExist.ToResponse()
	return res, nil
}

func Login(req model.UserLoginRequest) (*model.UserResponse, error) {
	user, err := dao.Search(req.Username)
	if err != nil {
		return nil, err
	}
	if !pkg.CheckPassword(user, req.Password) {
		return nil, err
	}
	res := user.ToResponse()
	return res, nil
}

func RefreshTokens(req model.RefreshRequest) (map[string]string, error) {
	claims, err := pkg.VerifyToken(req.RefreshToken, "refresh")
	if err != nil {
		return nil, err
	}
	userID := claims.UserID
	username := claims.Username
	role := claims.Role
	subject := claims.Subject
	tokens, err := pkg.GenerateTokens(userID, username, role, subject)
	if err != nil {
		return nil, err
	}
	return tokens, nil
}

func DeleteAccount(req model.UserDeleteRequest, username string) error {
	user, err := dao.Search(username)
	if err != nil {
		return errors.New("用户不存在")
	}
	if !pkg.CheckPassword(user, req.Password) {
		return errors.New("密码错误")
	}
	err = configs.DB.Delete(&user).Error
	if err != nil {
		return err
	}
	return nil
}

func AssignStudent(teacherID uint, req model.AssignStudentRequest) (*model.TeacherStudent, error) {
	student, err := dao.ExistsUserByID(req.StudentID)
	if err != nil {
		return nil, errors.New("学生不存在")
	}
	if student.Role != "student" {
		return nil, errors.New("只能绑定学生")
	}
	if dao.IsTeacherStudentRelated(teacherID, req.StudentID) {
		return nil, errors.New("该学生已绑定")
	}
	relation := &model.TeacherStudent{TeacherID: teacherID, StudentID: req.StudentID}
	if err := configs.DB.Create(relation).Error; err != nil {
		return nil, err
	}
	return relation, nil
}
