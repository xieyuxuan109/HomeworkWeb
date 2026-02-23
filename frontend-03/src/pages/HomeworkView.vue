<template>
    <el-dialog v-model="dialogFormVisible" :title="dialogTitle" width="500">
        <el-form :model="formData">
            <el-form-item label="id" :label-width="formLabelWidth">
                <el-input v-model="formData.id" autocomplete="off" />
            </el-form-item>
            <el-form-item label="作业标题" :label-width="formLabelWidth">
                <el-input v-model="formData.title" autocomplete="off" />
            </el-form-item>
            <el-form-item label="作业描述" :label-width="formLabelWidth">
                <el-input v-model="formData.description" autocomplete="off" />
            </el-form-item>
            <el-form-item label="学科" :label-width="formLabelWidth">
                <el-select v-model="formData.subject" placeholder="Please select a zone">
                    <el-option label="语文" value="chinese" />
                    <el-option label="数学" value="math" />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogFormVisible = false">Cancel</el-button>
                <el-button type="primary" @click="dialogFormVisible = false">
                    Confirm
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { watch, ref } from 'vue'

// 定义组件接收的 Props
const props = defineProps({
    // 控制对话框显示
    // visible: {
    //     type: Boolean,
    //     required: true,
    //     default: true
    // },
    // 对话框标题
    dialogTitle: {
        type: String,
        default: ''
    },
    // 表单数据对象
    // formData: {
    //     type: Object,
    //     required: true,
    //     default: () => ({})
    // },
})


// 定义组件可触发的事件
const emit = defineEmits(['update:visible', 'cancel', 'confirm'])

// 内部维护的显示状态，同步外部传入的 visible
const dialogFormVisible = ref(true)
const formLabelWidth = '140px'

// 监听外部 visible 变化
watch(() => props.visible, (newVal) => {
    dialogFormVisible.value = newVal
})

// 监听内部 dialogFormVisible 变化，通知父组件
watch(dialogFormVisible, (newVal) => {
    emit('update:visible', newVal)
})

const handleCancel = () => {
    dialogFormVisible.value = true
    emit('cancel')
}

const handleConfirm = () => {
    // 可以在这里进行表单验证
    emit('confirm', props.formData) // 将确认时的表单数据传回
    dialogFormVisible.value = true
}
</script>
