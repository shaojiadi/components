<template>
  <el-col class="dialog-form">
    <el-table ref="multipleTable" @selection-change="handleSelectionChange"   @select="handleSelect"  class="g-table flex-direction-box electric-box" :row-key="row => row.companyId" :data="tableList2" stripe style="width:100%;border-bottom: 0;height: 260px;" size="mini">
      <template slot="empty">
        <el-button v-if="tableListLoading" type="text" :loading="true">加载中</el-button>
        <span v-if="!tableListLoading">暂无数据</span>
      </template>
      <el-table-column :reserve-selection="true" type="selection" width="55">
      </el-table-column>
      <el-table-column  prop="companyIcName" show-overflow-tooltip>
        <template slot="header" slot-scope="scope">
          <el-select v-model="filters.companyIcId" placeholder="产业类型" size="mini" @change="search" clearable>
            <el-option
              v-for="(item,index) in industryList"
              :key="index"
              :label="item.icName"
              :value="item.icId"
            >
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column  prop="areaName" show-overflow-tooltip>
        <template slot="header" slot-scope="scope">
          <el-cascader
            v-model="secondAreaIds"
            :options="areaList"
            clearable
            collapse-tags
            :props="propsArea"
            @change="changeSearch"
            placeholder="所在区域"
          ></el-cascader>
        </template>
      </el-table-column>
      <el-table-column prop="companyName" show-overflow-tooltip>
        <template slot="header" slot-scope="scope">
          <el-input
            v-model="filters.companyName"
            size="mini"
            placeholder="请输入企业名称"
            @keyup.enter.native = "search"
            />
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip width="140px">
        <template slot="header" slot-scope="scope">
          <div style="float:right">
            <el-button type="text" @click="clearFilter">清除筛选</el-button>
            <span>已选：{{number}}家</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-col :span="24">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="filters.pageIndex" :page-size="filters.pageSize"
        layout="total, prev, pager, next, sizes, jumper" :total="filters.totalCount"
        style="float:right;margin-top: 0;">
      </el-pagination>
    </el-col>
  </el-col>
</template>

<script>
import {getInGardenCompanyList,icChooseList,assessmentAddAssessment,assessmentDetail,editAssessment} from "../service/getData";

export default {
  data(){
    return {
      tableList2: [],
      filters: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 10,
        companyName: '',
        companyIcId: '',
        secondAreaIds:'',
      },  
      industryList: [],
      number: 0,
      areaList: [],
      propsArea: {
        value: "areaId",
        label: "areaName",
        children: "secondList",
        multiple: true,
      },
    }
  },
  created() {
    this.getInGardenCompanyList();
  },
  methods: {
    getChooseList(){
      icChooseList().then((res) => {
      if (res.data.code != "success") {
        this.$message.error(res.data.message || res.data.msg);
        return;
      }
      this.industryList = res.data.data.icChooseList;
      })
    },
    getInGardenCompanyList(){
      getInGardenCompanyList(this.filters).then((res) => {
        if (res.data.code != "success") {
          this.$message.error(res.data.message || res.data.msg);
          return;
        }

        this.tableList2 = res.data.data.list;

        if(this.isEdit==true && this.count == 0){
          this.init();
        }

        if(this.count == 1){
          this.tableList2.forEach((item)=>{
            if(this.companies.includes(item.companyId)){
              this.$refs.multipleTable.toggleRowSelection(item,true);
            }
          })
        }
      
        this.filters.totalCount = res.data.data.totalCount;
      });
    },
    init(){
      assessmentDetail(this.assessmentId).then(res=>{
        if(res.data.code=='success'){
          this.count = 1;
          this.info = res.data.data.assessment;
          this.$set(this.info,'time',[this.info.assessmentStartTime,this.info.assessmentEndTime]);
          this.companies = res.data.data.companies;
          this.tableList2.forEach((item)=>{
            if(this.companies.includes(item.companyId)){
              this.$refs.multipleTable.toggleRowSelection(item,true);
            }
          })
          this.totalList.subList = res.data.data.fileds;
          this.totalList.subList.forEach(item=>{
            item.assessmentFiledFile==1? item.assessmentFiledFile=true:item.assessmentFiledFile=false
          })
          this.number = res.data.data.companies.length;

          let filters = {
            pageIndex: 1,
            pageSize: this.filters.totalCount,
            totalCount: 10,
            companyName: '',
            companyIcId: '',
            secondAreaIds:'',
          }
          getInGardenCompanyList(filters).then((res) => {
            if (res.data.code != "success") {
              this.$message.error(res.data.message || res.data.msg);
              return;
            }
            this.chooseData =  res.data.data.list.filter((item)=>{
              return this.companies.includes(item.companyId)
            })

          }); 
        }
      }).catch(_=>{
        console.log(_);
      })
    },
    submit(){
       let subList = JSON.parse(JSON.stringify(this.totalList.subList));
       subList.forEach(item=>{
         item.assessmentFiledFile==true? item.assessmentFiledFile=1:item.assessmentFiledFile=0
       })
       
      let chooseData = this.chooseData.map(item=>({
        assessmentCompanyName:item.companyName,
        assessmentCompanyCompanyId:item.companyId,
        assessmentCompanyArea: item.areaName,
        assessmentCompanyOne: item.companyFirstAreaId,
        assessmentCompanyTwo: item.companySecAreaId
      }))

       var infos = {
         assessment: this.info,
         fileds: subList,
         companies: chooseData
       }

        if(this.totalList.subList.length<=0){
          this.$message.error('考核项不能为空')
          return
        }

        if(this.chooseData.length<=0){
          this.$message.error('考核对象不能为空')
          return
        }

        this.$refs.info.validate((valid) => {
          if (valid) {
            this.$confirm('考核发起时间后考核任务信息无法进行编辑，请确认信息填写无误后操作，是否确认发起考核任务', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              if(this.isEdit!=true){
                assessmentAddAssessment(infos).then(res=>{
                  if(res.data.code=='success'){
                    this.$emit('closeDialog')
                  }
                })
              }else{
                editAssessment(infos).then(res=>{
                  if(res.data.code=='success'){
                    this.$emit('closeDialog')
                  }
                })
              }
            }).catch(_ => {
            });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
    },
    handleSelect(val,row){
      console.log(val,row,455);
      if(val.length>this.lastTableLength){
        this.number++;
        this.chooseData.push(row) 
      }else {
        this.number--;
        let index = this.chooseData.indexOf(row.companyId);
        this.chooseData.splice(index, 1)
      }
    },
    handleSelectionChange(val) {
      this.lastTableLength = val.length;
    },
    handleSizeChange(val) {
      this.filters.pageIndex = 1;
      this.filters.pageSize = val;
      this.getInGardenCompanyList();
    },
    handleCurrentChange(val) {
      this.filters.pageIndex = val;
      this.getInGardenCompanyList();
    },
    clearFilter(){

    },
    search(){

    }
  }
}
</script>

<style>

</style>