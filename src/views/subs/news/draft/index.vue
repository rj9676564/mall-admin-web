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
                <el-select v-model="listQuery.status">
                  <el-option key="1" label="全部" value=""/>
                  <el-option key="1" label="未分配" value="1"/>
                  <el-option key="1" label="已分配" value="2"/>
                </el-select>
              </el-form-item>
              <el-form-item label="文章分类">
                <el-select v-model="listQuery.categoryId" class="input-width" placeholder="全部" clearable>
                  <el-option key="1" label="全部" value=""/>
                  <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id"/>
                </el-select>
              </el-form-item>
              <el-form-item label="文章字数筛选">
                <!--                wordCountList-->
                <el-select v-model="listQuery.wordCount" class="input-width" placeholder="全部" clearable>
                  <el-option v-for="item in wordCountList" :key="item.id+'asdf'" :label="item.name" :value="item.id"/>
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
      <el-button size="mini" class="btn-add" type="primary" @click="handleAdd()" style="margin-left: 20px">存到公众号
      </el-button>
      <el-button size="mini" class="btn-add" type="primary" @click="handleDelete()" style="margin-left: 20px">批量删除
      </el-button>
    </el-card>
    <div class="table-container">
      <el-table ref="adminTable"
                :data="list"
                style="width: 100%;"
                @selection-change="handleSelectionNewsChange"
                v-loading="listLoading" border>

        <el-table-column type="selection" width="55" align="center"/>
        <el-table-column label="编号" width="100" align="center">
          <template slot-scope="scope">{{ scope.row.id }}</template>
        </el-table-column>
        <el-table-column label="标题" align="center">
          <template slot-scope="scope">{{ scope.row.title }}</template>
        </el-table-column>
        <el-table-column label="分类" width="100" align="center">
          <template slot-scope="scope">{{ scope.row.categoryName }}</template>
        </el-table-column>
        <el-table-column label="文章字数" width="100" align="center">
          <template slot-scope="scope">{{ scope.row.wordCount }}</template>
        </el-table-column>
        <el-table-column label="上传时间" width="160" align="center">
          <template slot-scope="scope">{{ scope.row.createTime | formatDateTime }}</template>
        </el-table-column>
        <el-table-column label="分配状态" width="100" align="center">
          <template slot-scope="scope">
<!--            <el-tag v-if="scope.row.status === 0" type="info">未分配</el-tag>-->
            <el-tag v-if="scope.row.status === 1" >未分配</el-tag>
            <el-tag v-if="scope.row.status === 2" type="success">已分配</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分配账户" width="160" align="center">
          <template slot-scope="scope">{{ scope.row.loginTime | formatDateTime }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="scope">
            <el-button size="mini"
                       type="text"
                       @click="handleSelectRole(scope.$index, scope.row)">删除
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
      title="请选择公众号"
      :visible.sync="dialogVisible"
      width="70%">
      <el-card>
        <el-form :model="admin"
                 ref="adminForm"
                 label-position="top"
                 label-width="150px" size="small">
          <el-form-item>
            <el-row>
              <el-col l :span="8">
                <el-form-item label="分配数量：">
                  <el-input-number v-model="admin.allocationCount" :min="1" :max="10" label="描述文字"></el-input-number>
                </el-form-item>
              </el-col>
              <el-col l :span="8">
                <el-form-item label="开启原创：">
                  <el-radio-group v-model="admin.radioValue">
                    <el-radio label="on">开启</el-radio>
                    <el-radio label="off">关闭</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col l :span="8">
                <!--              <el-form-item label="分配数量：">-->
                <!--                <el-input-number v-model="admin.id" @change="handleChange" :min="1" :max="10" label="描述文字"></el-input-number>-->
                <!--              </el-form-item>-->
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item>
            <el-table :data="wxList" border style="width: 100%"
                      @selection-change="handleSelectionUserChange"
            >
              <el-table-column type="selection" width="55" align="center"></el-table-column>
              <el-table-column prop="id" label="编号" width="80">
                <template slot-scope="scope">{{ scope.row.id }}</template>
              </el-table-column>
              <el-table-column prop="publicAccount" label="公众号" align="center">
                <template slot-scope="scope">{{ scope.row.nickName }}</template>
              </el-table-column>
              <el-table-column prop="fansCount" label="粉丝数" align="center">
                <template slot-scope="scope">{{ scope.row.fansNum }}</template>
              </el-table-column>
              <el-table-column prop="totalIncome" label="总收益" align="center">
                <template slot-scope="scope">{{ scope.row.totalIncome }}</template>
              </el-table-column>
              <el-table-column prop="homeworkRead" label="昨日阅读" align="center">
                <template slot-scope="scope">{{ '0' }}</template>
              </el-table-column>
              <el-table-column prop="draftToday" label="今日存稿" align="center">
                <template slot-scope="scope">{{ scope.row.uploadNum }}</template>
              </el-table-column>
              <el-table-column prop="allocationStatus" label="分配状态" align="center">
                <template slot-scope="scope">{{ scope.row.rebateStatus }}</template>
              </el-table-column>
              <el-table-column prop="info" label="提示信息" align="center">
                <template slot-scope="scope">{{ scope.row.nickName }}</template>
              </el-table-column>
            </el-table>
          </el-form-item>
          <el-form-item>
            <el-button @click="dialogVisible = false" size="small">取 消</el-button>
            <el-button type="primary" @click="handleDialogConfirm()" size="small">确 定</el-button>
          </el-form-item>
        </el-form>

      </el-card>

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
import {newsCategoryList, newsList, saveToWechat, wxAccountList, wxUserList} from "../../../../api/laibin";
import QrcodeVue from 'vue-qrcode-component';

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  keyword: null,
  wordCount: 0,
  categoryId: null
};
const defaultAdmin = {
  allocationCount: 0,
  radioValue: true,
};
export default {
  name: 'adminList',
  components: {
    QrcodeVue
  },
  data() {
    return {
      listQuery: Object.assign({}, defaultListQuery),
      list: null,
      total: null,
      listLoading: false,
      dialogVisible: false,
      categoryList: [],
      admin: Object.assign({}, defaultAdmin),
      isEdit: false,
      allocDialogVisible: false,
      allocRoleIds: [],
      allRoleList: [],
      wxList: [],
      multipleNewsSelection: [],
      multipleUserSelection: [],
      wordCountList: [
        {
          id: 0,
          name: '全部'
        },
        {
          id: 1,
          name: '800-1000字'
        },
        {
          id: 2,
          name: '1000-1500字'
        },
        {
          id: 3,
          name: '1500-2000字'
        },
        {
          id: 4,
          name: '2000字以上'
        }
      ],
      allocAdminId: null
    }
  },
  created() {
    this.getList();
    this.getCategoryList();
    this.getWxAccountList();
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

    handleSelectionNewsChange(selection) {
      this.multipleNewsSelection = selection;

    },
    handleSelectionUserChange(selection) {
      this.multipleUserSelection = selection;
    },
    getCategoryList() {
      newsCategoryList().then(response => {
        this.categoryList = response.data;
      });
    },
    getWxAccountList() {
      console.log("wxuser")
      wxUserList({}).then(response => {
        this.wxList = response.data.list;
      });
    },
    handleChange(val) {
      console.log(val);
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
      // 至少选择一篇 news
      if (this.multipleNewsSelection.length === 0) {
        this.$message({
          message: '请选择至少一篇文章',
          type: 'warning'
        });
        return;
      }

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
    handleUpdate(index, row) {
      this.dialogVisible = true;
      this.isEdit = true;
      this.admin = Object.assign({}, row);
    },
    handleDialogConfirm() {
      this.$confirm('是否要确认?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 获取选中的 news
        let news = this.multipleNewsSelection;
        let newsIds = [];
        for (let i = 0; i < news.length; i++) {
          newsIds.push(news[i].id);
        }
        // 获取选中的 user
        let users = this.multipleUserSelection;
        let userIds = [];
        for (let i = 0; i < users.length; i++) {
          userIds.push(users[i].appid);
        }
        saveToWechat({
          newsIds: newsIds,
          userIds: userIds,
          originalEnabled: this.admin.radioValue,
          allocationCount: this.admin.allocationCount,
        }).then(response => {
          this.$message({
            message: '存稿成功！',
            type: 'success'
          });
          this.dialogVisible = false;

        })
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
      this.allocAdminId = row.id;
      this.allocDialogVisible = true;
      this.getRoleListByAdmin(row.id);
    },
    getList() {
      this.listLoading = true;
      newsList(this.listQuery).then(response => {
        this.listLoading = false;
        this.list = response.data.list;
        this.total = response.data.total;
      });
    },
    getAllRoleList() {

      var canvas = document.getElementById('canvas')

      QRCode.toCanvas(document.getElementById('canvas'), 'sample text', function (error) {
        if (error) console.error(error)
        console.log('success!');
      })
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


