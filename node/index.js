var exp=require('express');
var fs=require('fs');
var multer=require('multer');
var bodyP=require('body-parser');
var cookieP=require('cookie-parser');

var app=exp();
app.use(exp.static('www'));
app.use(bodyP.urlencoded({extended:true}));
app.use(cookieP());
app.listen(3000,()=>{console.log('服务器已开启-------------------------')})

//-------------创建备忘录文件夹名字---------------
app.post('/create',(req,res)=>{
	//封装发送给前端数据的方法
	function status(code,msg){
		res.status(200).json({code,msg})
	}
	//创建备忘录
	function create(){
		var filename=`note/${req.body.name}.json`;
		fs.appendFile(filename,JSON.stringify(req.body),(err)=>{
			if(err){
				status(3,'备忘录写入数据错误'	)
			}
			else{
				status(1,'备忘录写入数据成功'	)
			}
		})
	}
	//创建装所有备忘录的文件夹
	fs.access('note',(err)=>{
		if(!err){
			//创建备忘录
			create();
		}
		else{
			fs.mkdir('note',(err)=>{
				err?status(0,'创建note失败'):status(2,'创建note成功')
			})
			//创建备忘录
			create();
		}
	})
})


//-------------------提取index页面信息--------

app.get('/index',(req,res)=>{
	fs.readdir('note',(er,files)=>{
		var i=0;
		var files=files.reverse();
		//存备忘录文件名字的数组和存文件中内容的个数的数组
		var list=[];
		var nums=[];
		traverse();	
		function traverse(){
			if(i<files.length){				
				var name=files[i].split('.')[0];
				fs.readFile(`note/${files[i]}`,(err,data)=>{
					var o=JSON.parse(data);
					//文件中内容的个数
					var num=Object.keys(o).length-1;
					nums.push(num);
					list.push(name);
					i++;
					traverse();
				})
			}
			else{
				res.status(200).json({list,nums});
			}
		}
	})
})


//----------------提交备忘录内容----------

app.post('/index/complete',(req,res)=>{
	//找到当前备忘录是哪个文件夹的
	var filename=`note/${req.cookies.listname}.json`;
	fs.access(filename,(err)=>{
		if(!err){
			fs.readFile(filename,(err,data)=>{
				if(!err){
					var obj=JSON.parse(data);
					//定义备忘录内容的名字
					var num='content'+Object.keys(obj).length;
					obj[num]=req.body.content;
					fs.writeFile(filename,JSON.stringify(obj),(err)=>{
						if(!err){
							res.status(200).json({
								code:1,
								msg:'内容存入成功'
							})
						}
						else{
							res.status(200).json({
								code:0,
								msg:'内容存入失败'
							})
						}
					})
				}
			})
		}
	})
})



//----------------提取备忘录内容--------

app.get('/index/content',(req,res)=>{
	var filename=`note/${req.cookies.listname}.json`;
	fs.readFile(filename,(err,data)=>{
		if(!err){
			res.status(200).json(JSON.parse(data))
		}
	})
})


//----------------编辑内容----------------

app.post('/index/edit',(req,res)=>{
	var filename=`note/${req.cookies.listname}.json`;
	var num=req.cookies.num;
	fs.readFile(filename,(err,data)=>{
		if(!err){
			var obj=JSON.parse(data);
			//修改的内容在文件的下标
			var index=Object.keys(obj)[num];
			obj[index]=req.body.content;
			fs.writeFile(filename,JSON.stringify(obj),(err)=>{
				if(!err){
					res.status(200).json({
						code:1,
						msg:'修改内容成功'
					})
				}
			})
		}
	})
	
})
