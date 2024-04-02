<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never">
      <div>
        <i class="el-icon-search"></i>
        <span>公众号列表</span>
      </div>
      <div style="margin-top: 15px;display: flex">
        <div style="flex: 1;">
          <el-form :inline="true" :model="listQuery" size="small" label-width="140px">
            <el-row>
              <el-form-item label="公众号名称">
                <el-input v-model="listQuery.keyword" class="input-width" placeholder="公众号名称" clearable></el-input>
              </el-form-item>
              <el-form-item label="所属用户">
                <el-input v-model="listQuery.keyword" class="input-width" placeholder="所属用户" clearable></el-input>
              </el-form-item>
              <el-form-item label="查询时间">
                <el-input v-model="listQuery.keyword" class="input-width" placeholder="查询时间" clearable></el-input>
              </el-form-item>
              <el-form-item label="排序">
                <el-input v-model="listQuery.keyword" class="input-width" placeholder="帐号/姓名" clearable></el-input>
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
      <el-button size="mini" class="btn-add" type="primary" @click="handleAdd()" style="margin-left: 20px">绑定公众号
      </el-button>

    </el-card>
    <div class="table-container">
      <el-table ref="adminTable"
                :data="list"
                style="width: 100%;"
                v-loading="listLoading" border>
        <el-table-column label="编号" width="180" align="center">
          <template slot-scope="scope">{{ scope.row.appid }}</template>
        </el-table-column>
        <el-table-column label="公众号" align="center">
          <template slot-scope="scope">{{ scope.row.nickName }}</template>
        </el-table-column>
        <el-table-column label="总收益" width="70" align="center">
          <template slot-scope="scope" ><span style="color: red">
            {{ scope.row.totalIncome/100 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="昨日收益" width="80" align="center">
          <template slot-scope="scope">
            <span style="color: darkgoldenrod">
              {{ scope.row.totalIncome/100 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="授权状态" width="80" align="center">
          <template slot-scope="scope">通过</template>
        </el-table-column>
        <el-table-column label="流量主状态" width="100" align="center">
          <template slot-scope="scope">{{ scope.row.rebateStatus  }}</template>
        </el-table-column>
        <el-table-column label="收款账户" align="center">
          <template slot-scope="scope">{{ scope.row.loginTime  }}</template>
        </el-table-column>
        <el-table-column label="所属用户" width="90" align="center">
          <template slot-scope="scope">{{ scope.row.parentAccount }}</template>
        </el-table-column>

        <el-table-column label="操作" width="250" align="center">
          <template slot-scope="scope">
            <el-button size="mini"
                       v-if="scope.row.cookie == null"
                       type="text"
                       @click="handlePermission(scope.$index, scope.row)">账号授权(72h)
            </el-button>
            <el-button size="mini"
                       type="text"
                       @click="handleSelectRole(scope.$index, scope.row)">开通流量主
            </el-button>
            <el-button size="mini"
                       type="text"
                       @click="handleDelete(scope.$index, scope.row)">完善流量主信息
            </el-button>
<!--            <el-button size="mini"-->
<!--                       type="text"-->
<!--                       @click="handleSelectRole(scope.$index, scope.row)">绑定IP-->
<!--            </el-button>-->
<!--            <el-button size="mini"-->
<!--                       type="text"-->
<!--                       @click="handleUpdate(scope.$index, scope.row)">-->
<!--              发布文章-->
<!--            </el-button>-->

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
      title="扫码添加公众号"
      :visible.sync="dialogVisible"
      width="40%">
      <el-row style="text-align: center;">
        <qrcode-vue :text="bingUrl"
                    size="300"
                    color="#000"
                    bg-color="#FFFFFF"
                    style="display: inline-block; width: auto;"
                    error-level="L"></qrcode-vue>

      </el-row>
    </el-dialog>
    <el-dialog
      title="分配角色"
      :visible.sync="allocDialogVisible"
      width="30%">
      <qrcode-vue :text="bingUrl"
                  size="300"
                  color="#000"
                  bg-color="#FFFFFF"
                  style="display: inline-block; width: auto;"
                  error-level="L"></qrcode-vue>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allocDialogVisible = false" size="small">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {fetchList, createAdmin, updateAdmin, updateStatus, deleteAdmin, getRoleByAdmin, allocRole} from '@/api/login';
import {fetchAllRoleList} from '@/api/role';
import {formatDate} from '@/utils/date';
import {bindGzh, getGzhLoginQrcode, wxAccountList} from "../../../api/laibin";
import QrcodeVue from "vue-qrcode-component";

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  keyword: null
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
  components: {QrcodeVue},
  data() {
    return {
      listQuery: Object.assign({}, defaultListQuery),
      list: null,
      total: null,
      listLoading: false,
      dialogVisible: false,
      bingUrl: "",
      admin: Object.assign({}, defaultAdmin),
      isEdit: false,
      allocDialogVisible: false,
      allocRoleIds: [],
      allRoleList: [],
      wordCountList: [
        0, 800, 1200, 1500, 1800, 2000
      ],
      allocAdminId: null
    }
  },
  created() {
    this.getList();
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
      bindGzh().then(response => {
        this.bingUrl = response.data;
        this.dialogVisible = true;
        this.isEdit = false;
        this.admin = Object.assign({}, defaultAdmin);
      });


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
        if (this.isEdit) {
          updateAdmin(this.admin.id, this.admin).then(response => {
            this.$message({
              message: '修改成功！',
              type: 'success'
            });
            this.dialogVisible = false;
            this.getList();
          })
        } else {
          createAdmin(this.admin).then(response => {
            this.$message({
              message: '添加成功！',
              type: 'success'
            });
            this.dialogVisible = false;
            this.getList();
          })
        }
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
    handlePermission(index, row) {
      console.log(JSON.stringify(row.appid))
      getGzhLoginQrcode(row.appid).then(response => {
        this.bingUrl = response.data;
        this.allocAdminId = row.id;
        this.allocDialogVisible = true;
      });

      // this.getRoleListByAdmin(row.id);
    },
    getList() {
      this.listLoading = true;
      wxAccountList({}).then(response => {
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


