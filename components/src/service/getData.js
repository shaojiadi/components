import axios from 'axios';


let url = 'http://test-mh-gander.test176.cn'



let icChooseList = () => axios.get(`${url}/garden/companyStatistic/icChooseList`);


/*
企业列表
参数名	必选	类型	说明
pageIndex	是	int	
pageSize	是	int	
companyName	否	string	企业名称
secondAreaIds	否	List	多选二级区域id
companyIcId	否	int	企业产业id
*/
let getInGardenCompanyList = (data) => axios.get(`${url}/garden/assessment/getInGardenCompanyList`, { params: data });


/**
 考核详情
 参数名	必选	类型	说明
 assessmentId	是	long	考核id
 */
 let assessmentDetail = (assessmentId) => axios.get(`${url}/garden/assessment/assessmentDetail?assessmentId=${assessmentId}`);



export  {
  icChooseList,getInGardenCompanyList,assessmentDetail
}

