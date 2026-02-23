package model

import (
	"time"

	"gorm.io/gorm"
)

// 用户表
type User struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Password string `json:"-"`
	Nickname string `json:"nickname"`
	Email    string `json:"email,omitempty"`
	Role     string `gorm:"default:'student'" json:"role"`
	Subject  string `json:"subject" gorm:"column:subject"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// 用户注册请求
type UserRegisterRequest struct {
	Username   string `json:"username" binding:"required,min=1,max=50"`
	Password   string `json:"password" binding:"required,min=1,max=100"`
	Nickname   string `json:"nickname" binding:"required,min=1,max=50"`
	Subject    string `json:"subject"`
	Department string `json:"department"`
	Role       string `json:"role"`
}

// 用户登录请求
type UserLoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// 用户注销账户结构体
type UserDeleteRequest struct {
	Password string `json:"password" binding:"required"`
}

// 用户刷新token结构体
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// 用户响应
type UserResponse struct {
	ID              uint   `json:"id"`
	Username        string `json:"username"`
	Nickname        string `json:"nickname"`
	Email           string `json:"email"`
	Role            string `json:"role"`
	Subject         string `json:"subject"`
	SubjectLabel    string `json:"subject_label"`
	Department      string `json:"department,omitempty"`
	DepartmentLabel string `json:"department_label,omitempty"`
}

// 用户关系
type TeacherStudent struct {
	ID        uint      `json:"id"`
	TeacherID uint      `json:"teacher_id"`
	StudentID uint      `json:"student_id"`
	CreatedAt time.Time `json:"create_at"`
}

// 获取学科中文标签
func GetSubjectLabel(subject string) string {
	labels := map[string]string{
		"chinese":   "语文",
		"math":      "数学",
		"english":   "英语",
		"physics":   "物理",
		"chemistry": "化学",
		"biology":   "生物",
		"history":   "历史",
		"geography": "地理",
		"politics":  "政治",
	}
	return labels[subject]
}

// 转换为响应格式
func (u *User) ToResponse() *UserResponse {
	return &UserResponse{
		ID:              u.ID,
		Username:        u.Username,
		Nickname:        u.Nickname,
		Email:           u.Email,
		Role:            u.Role,
		Subject:         u.Subject,
		SubjectLabel:    GetSubjectLabel(u.Subject),
		Department:      u.Subject,
		DepartmentLabel: GetSubjectLabel(u.Subject),
	}
}

type AssignStudentRequest struct {
	StudentID uint `json:"student_id" binding:"required"`
}
