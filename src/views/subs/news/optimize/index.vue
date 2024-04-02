<template> 
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>草稿箱</span>
      </div>
      <div style="margin-top: 15px;display: flex">
        <div style="flex: 1;">
          <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
            <el-row>
              <el-form-item label="文章标题">
                <el-input v-model="listQuery.keyword" class="input-width" placeholder="公众号名称" clearable></el-input>
              </el-form-item>
              <el-form-item label="文章状态">
                <el-select v-model="listQuery.status" class="input-width" placeholder="全部" clearable>
                  <el-option key="1" label="全部" value=""/>
                  <el-option key="1" label="未发布" value="0"/>
                  <el-option key="1" label="已发布" value="1"/>
                </el-select>
              </el-form-item>
              <el-form-item label="文章分类">
                <el-select v-model="listQuery.categoryId" class="input-width" placeholder="全部" clearable>
                  <el-option key="1" label="全部" value=""/>
                  <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id"/>
                </el-select>
              </el-form-item>
            </el-row>
          </el-form>
        </div>

        <div>
          <el-col>
            <el-row>
              <el-button
                style="float:right;width: 100px;margin-bottom: 20px"
                type="primary"
                @click="handleSearchList()"
                size="small">
                查询搜索
              </el-button>
            </el-row>
            <el-row>
              <el-button
                style="float:right;width: 100px"
                @click="handleResetSearch()"
                size="small">
                重置
              </el-button>
            </el-row>
          </el-col>
        </div>
      </div>
    </el-card>
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
      <el-button size="mini" class="btn-add" type="primary" @click="handleAdd()" style="margin-left: 20px">上传文章文件夹
      </el-button>
      <!--      <el-button size="mini" class="btn-add" type="primary" @click="handleAdd()" style="margin-left: 20px">批量删除-->
      <!--      </el-button>-->
    </el-card>
    <div class="table-container">
      <el-table ref="adminTable"
                :data="list"
                style="width: 100%;"
                v-loading="listLoading" border>
        <el-table-column label="编号" width="50" align="center">
          <template slot-scope="scope">{{ scope.row.id }}</template>
        </el-table-column>
        <el-table-column label="标题" align="center">
          <template slot-scope="scope">{{ scope.row.title }}</template>
        </el-table-column>
        <el-table-column label="润色标题" align="center">
          <template slot-scope="scope">{{ scope.row.newTitle }}</template>
        </el-table-column>
        <el-table-column label="分类" width="80" align="center">
          <template slot-scope="scope">{{ scope.row.categoryName }}</template>
        </el-table-column>
        <el-table-column label="润色状态" width="80" align="center">

          <template slot-scope="scope">
            <span v-if="scope.row.status==0">未润色</span>
            <span v-else-if="scope.row.status==1">润色完成</span>
            <span v-else>润色失败</span>
          </template>
        </el-table-column>
        <el-table-column label="提示" width="100" align="center">
          <template slot-scope="scope">{{ scope.row.statusName | formatDateTime }}</template>
        </el-table-column>
        <el-table-column label="操作" width="60" align="center">
          <template slot-scope="scope">
            <el-button size="mini"
                       type="text"
                       @click="handleSelectRole(scope.$index, scope.row)">待开发
            </el-button>

          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes,prev, pager, next,jumper"
        :current-page.sync="listQuery.pageNum"
        :page-size="listQuery.pageSize"
        :page-sizes="[10,15,20]"
        :total="total">
      </el-pagination>
    </div>
    <el-dialog
      :title="'上传文件'"
      :visible.sync="dialogVisible"
      width="40%">
      <el-form :model="admin"
               ref="adminForm"
               label-width="150px" size="small">
        <el-form-item label="请选择分类标签：">
          <el-select v-model="admin.categoryId"
                     placeholder="请选择分类">
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择文件：">
          <el-upload
            action="/upload"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileList"
            :limit="1"
          >
            <el-button size="small" type="primary">选择文件</el-button>
          </el-upload>

        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="handleDialogConfirm()" size="small">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="分配角色"
      :visible.sync="allocDialogVisible"
      width="30%">
      <el-select v-model="allocRoleIds" multiple placeholder="请选择" size="small" style="width: 80%">
        <el-option
          v-for="item in allRoleList"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allocDialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="handleAllocDialogConfirm()" size="small">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {fetchList, createAdmin, updateAdmin, updateStatus, deleteAdmin, getRoleByAdmin, allocRole} from '@/api/login';
import {fetchAllRoleList} from '@/api/role';
import {formatDate} from '@/utils/date';
import {newsCategoryList, newsList, newsOriginalList} from "../../../../api/laibin";
import request from "../../../../utils/request";
import axios from "axios";

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  categoryId: null,
  status: null
};
const defaultAdmin = {
  id: null,
  username: null,
  password: null,
  nickName: null,
  email: null,
  note: null,
  status: 1
};
export default {
  name: 'adminList',
  data() {
    return {
      listQuery: Object.assign({}, defaultListQuery),
      list: null,
      categoryList: null,
      total: null,
      listLoading: false,
      dialogVisible: false,
      admin: Object.assign({}, defaultAdmin),
      isEdit: false,
      allocDialogVisible: false,
      allocRoleIds: [],
      allRoleList: [],
      allocAdminId: null,
      fileList: [],
      upLoadFile: null,
    }
  },
  created() {
    this.getList();
    this.getCategoryList();
    this.getAllRoleList();
  },
  filters: {
    formatDateTime(time) {
      if (time == null || time === '') {
        return 'N/A';
      }
      let date = new Date(time);
      return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
    }
  },
  methods: {
    handleFileChange(file, fileList) {
      // 更新选择的文件
      this.upLoadFile = file;
      console.log(file);
      console.log(fileList);

    },
    handleResetSearch() {
      this.listQuery = Object.assign({}, defaultListQuery);
    },
    handleSearchList() {
      this.listQuery.pageNum = 1;
      this.getList();
    },
    handleSizeChange(val) {
      this.listQuery.pageNum = 1;
      this.listQuery.pageSize = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.pageNum = val;
      this.getList();
    },
    handleAdd() {
      this.dialogVisible = true;
      this.isEdit = false;
      this.admin = Object.assign({}, defaultAdmin);
    },
    handleStatusChange(index, row) {
      this.$confirm('是否要修改该状态?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateStatus(row.id, {status: row.status}).then(response => {
          this.$message({
            type: 'success',
            message: '修改成功!'
          });
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消修改'
        });
        this.getList();
      });
    },
    handleDelete(index, row) {
      this.$confirm('是否要删除该用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteAdmin(row.id).then(response => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          this.getList();
        });
      });
    },
    handleDialogConfirm() {
      this.$confirm('是否要确认?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const formData = new FormData();
        formData.append('file', this.upLoadFile.raw);
        formData.append('categoryId', this.admin.categoryId);
        request({
          url: '/news_original/unzip',
          method: 'post',
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          data: formData
        }).then(response => {
          console.log('Upload successful!', response.data);
        }).catch(error => {
          console.error('Upload failed!', error);
        });
      })
    },
    handleAllocDialogConfirm() {
      this.$confirm('是否要确认?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let params = new URLSearchParams();
        params.append("adminId", this.allocAdminId);
        params.append("roleIds", this.allocRoleIds);
        allocRole(params).then(response => {
          this.$message({
            message: '分配成功！',
            type: 'success'
          });
          this.allocDialogVisible = false;
        })
      })
    },
    handleSelectRole(index, row) {
      // this.allocAdminId = row.id;
      // this.allocDialogVisible = true;
      // this.getRoleListByAdmin(row.id);
    },
    getCategoryList() {
      newsCategoryList().then(response => {
        this.categoryList = response.data;
      });
    },
    getList() {
      this.listLoading = true;
      newsOriginalList(this.listQuery).then(response => {
        this.listLoading = false;
        this.list = response.data.list;
        this.total = response.data.total;
      });
    },
    getAllRoleList() {
      fetchAllRoleList().then(response => {
        this.allRoleList = response.data;
      });
    },
    getRoleListByAdmin(adminId) {
      getRoleByAdmin(adminId).then(response => {
        let allocRoleList = response.data;
        this.allocRoleIds = [];
        if (allocRoleList != null && allocRoleList.length > 0) {
          for (let i = 0; i < allocRoleList.length; i++) {
            this.allocRoleIds.push(allocRoleList[i].id);
          }
        }
      });
    }
  }
}
</script>
<style></style>


