package model

import (
	"time"

	"gorm.io/gorm"
)

// 学生作业结构体
type Homework struct {
	ID          uint           `json:"id"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Subject     string         `json:"subject"`
	CreatorID   uint           `json:"creator_id"`
	Deadline    time.Time      `json:"deadline"`
	AllowLate   bool           `json:"allow_late"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	Creator     User           `gorm:"foreignKey:CreatorID;references:ID"`
	Submissions []Submission   `gorm:"foreignKey:HomeworkID"`
}

// 发布作业请求结构体
type PostHomework struct {
	Title       string    `json:"title" binding:"required"`
	Description string    `json:"description"`
	Subject     string    `json:"subject"`
	Department  string    `json:"department"`
	Deadline    time.Time `json:"deadline" binding:"required"`
	AllowLate   bool      `json:"allow_late" binding:"required"`
}

// 发布作业响应结构体
type HomeworkResponse struct {
	ID              uint      `json:"id"`
	Title           string    `json:"title"`
	Subject         string    `json:"subject" binding:"required,oneof=chinese math english physics chemistry biology history geography politics"`
	SubjectLabel    string    `json:"subject_label"`
	Department      string    `json:"department,omitempty"`
	DepartmentLabel string    `json:"department_label,omitempty"`
	Deadline        time.Time `json:"deadline" binding:"required"`
	AllowLate       bool      `json:"allow_late" binding:"required"`
}

// 修改作业请求结构体
type UpdateHomework struct {
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Deadline    time.Time `json:"deadline"`
	AllowLate   bool      `json:"allow_late"`
}

// 转换为响应格式
func (u *Homework) ToResponse() *HomeworkResponse {
	return &HomeworkResponse{
		ID:              u.ID,
		Title:           u.Title,
		Subject:         u.Subject,
		SubjectLabel:    GetSubjectLabel(u.Subject),
		Department:      u.Subject,
		DepartmentLabel: GetSubjectLabel(u.Subject),
		Deadline:        u.Deadline,
		AllowLate:       u.AllowLate,
	}
}
