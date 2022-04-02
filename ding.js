const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')
const app = express()
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

app.use(bodyParser.json())
app.all('*', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    res.setHeader("Content-Type", "application/json;charset=utf-8");
    next();
});

//鼎里首页帖子读取
app.get('/index/cauldron_front', (request, response) => {
    let file = path.join(__dirname, 'data/cauldron.json');
    fs.readFile(file, 'utf-8', function (err, data) {
        if (err) {
            response.send({ message: '文件读取失败', message_code: -1 });
        } else {
            let raw = JSON.parse(data)
            let result = raw.posts.map((post) => {
                let dislikeCopy = post.dislike.slice()
                dislikeCopy.sort((first, second) => second.list.length - first.list.length)
                return {
                    id: post.id,
                    cat_name: post.cat_name,
                    cat_url: post.cat_url,
                    time: post.time,
                    content: post.content,
                    comments: post.comments.length,
                    hot_comments: post.comments.filter((comment) => {
                        return comment.like > Math.max(5, post.views / 40)
                    }),
                    dislike: post.dislike.reduce((previousSum, currentMark) => {
                        return previousSum + currentMark.list.length
                    }, 0),
                    most_dislike_type: dislikeCopy[0].type,
                    most_dislike_count: dislikeCopy[0].list.length,
                    like: post.like.length,
                    is_liked: post.like.includes(+request.query.uid),
                    is_disliked: post.dislike.reduce((previous, current) => {
                        return previous || current.list.includes(+request.query.uid)
                    }, false)
                }
            })
            response.send(JSON.stringify({
                searchHotSpot: raw.searchHotSpot,
                posts: result
            }));
        }
    })
})

//鼎里详情页帖子读取
app.get('/detail/cauldron_detail', (request, response) => {
    let file = path.join(__dirname, 'data/cauldron.json');
    fs.readFile(file, 'utf-8', function (err, data) {
        if (err) {
            response.send({ message: '文件读取失败', message_code: -1 });
        } else {
            let post = JSON.parse(data).posts.filter((post) => post.id === +request.query.pid)[0]
            let dislikeCopy = post.dislike.slice()
            dislikeCopy.sort((first, second) => second.list.length - first.list.length)
            response.send(JSON.stringify({
                id: post.id,
                cat_name: post.cat_name,
                cat_url: post.cat_url,
                time: post.time,
                content: post.content,
                comments: post.comments,
                tags: post.tags,
                views: post.views,
                hot_spot_index: post.hot_spot_index,
                subscriptions: post.subscriptions.length,
                dislike: post.dislike.reduce((previousSum, currentMark) => {
                    return previousSum + currentMark.list.length
                }, 0),
                most_dislike_type: dislikeCopy[0].type,
                most_dislike_count: dislikeCopy[0].list.length,
                like: post.like.length,
                is_liked: post.like.includes(+request.query.uid),
                is_disliked: post.dislike.reduce((previous, current) => {
                    return previous || current.list.includes(+request.query.uid)
                }, false),
                is_subscribed: post.subscriptions.includes(+request.query.uid)
            }))
        }
    })
})

//读取用户搜索历史
app.post('/search/cauldron&type=history', (request, response) => {
    let file = path.join(__dirname, `data/search_history.json`)
    fs.readFile(file, 'utf-8', function (err, data) {
        if (err) {
            response.send({ message: '文件读取失败', message_code: -1 });
        } else {
            response.send(data);
        }
    })
})

//读取搜索发现等推荐内容
app.post('/search/cauldron&type=suggestion', (request, response) => {
    let file = path.join(__dirname, `data/search_suggestion.json`)
    fs.readFile(file, 'utf-8', function (err, data) {
        if (err) {
            response.send({ message: '文件读取失败', message_code: -1 });
        } else {
            response.send(data);
        }
    });
})

//搜索页读取用户搜索的帖子
app.post('/search/cauldron&type=filter', (request, response) => {
    let file = path.join(__dirname, 'data/cauldron.json')
    fs.readFile(file, 'utf-8', function (err, data) {
        if (err) {
            response.send({ message: '文件读取失败', message_code: -1 })
        } else {
            let keyword = request.body.keyword
            let result = JSON.parse(data).posts.filter((post) => {
                return post.content.indexOf(keyword) !== -1
            })
            response.send(result.map((post) => {
                let dislikeCopy = post.dislike.slice()
                dislikeCopy.sort((first, second) => second.list.length - first.list.length)
                return {
                    id: post.id,
                    cat_name: post.cat_name,
                    cat_url: post.cat_url,
                    time: post.time,
                    content: post.content,
                    comments: post.comments.length,
                    hot_comments: post.comments.filter((comment) => {
                        return comment.like > Math.max(5, post.views / 40)
                    }),
                    dislike: post.dislike.reduce((previousSum, currentMark) => {
                        return previousSum + currentMark.list.length
                    }, 0),
                    most_dislike_type: dislikeCopy[0].type,
                    most_dislike_count: dislikeCopy[0].list.length,
                    like: post.like.length,
                    is_liked: post.like.includes(+request.query.uid),
                    is_disliked: post.dislike.reduce((previous, current) => {
                        return previous || current.list.includes(+request.query.uid)
                    }, false)
                }
            }))
        }
    })
})

//新增鼎里帖子评论
app.post('/post&action=comment', (request, response) => {
    let file = path.join(__dirname, 'data/cauldron.json')
    fs.readFile(file, 'utf-8', (err, data) => {
        if (err) {
            response.send({ message: '文件读取失败', message_code: -1 })
        } else {
            let comment = request.body
            let database = JSON.parse(data)
            let posts = database.posts
            let latest_rpid = database.latest_rpid
            posts.forEach((post) => {
                if (post.id === comment.pid) {
                    post.comments.push({
                        rpid: latest_rpid + 1,
                        root: comment.root,
                        parent: comment.parent,
                        time: comment.time,
                        message: comment.message,
                        signature: comment.signature,
                        like: [],
                        report: []
                    })
                    database.latest_rpid += 1
                }
            })
            fs.writeFile(file, JSON.stringify(database), 'utf-8', (err) => {
                if (err) {
                    response.send({ message: '评论失败', message_code: -1 })
                }
                else {
                    response.send({ message: '评论成功', message_code: 1 })
                }
            })

        }
    })
})

//点赞帖子
app.post('/post&action=like&target=post', (request, response) => {
    let file = path.join(__dirname, 'data/cauldron.json')
    fs.readFile(file, 'utf-8', function (err, data) {
        if (err) {
            response.send({ message: '文件读取失败', message_code: -1 })
        } else {
            let database = JSON.parse(data)
            database.posts.forEach((post) => {
                if (post.id === +request.body.pid) {
                    if (post.like.includes(+request.body.uid)) {
                        response.send({ message: '点赞重复', message_code: 2 })
                    }
                    else {
                        post.like.push(+request.body.uid)
                    }
                }
            })
            fs.writeFile(file, JSON.stringify(database), 'utf-8', (err) => {
                if (err) {
                    response.send({ message: '点赞失败', message_code: -1 })
                }
                else {
                    response.send({ message: '点赞成功', message_code: 1 })
                }
            })
        }
    })
})

//取消点赞帖子
app.post('/post&action=cancel_like&target=post', (request, response) => {
    let file = path.join(__dirname, 'data/cauldron.json')
    fs.readFile(file, 'utf-8', function (err, data) {
        if (err) {
            response.send({ message: '文件读取失败', message_code: -1 })
        } else {
            let database = JSON.parse(data)
            database.posts.forEach((post) => {
                if (post.id === +request.body.pid) {
                    if (post.like.includes(+request.body.uid)) {
                        post.like = post.like.filter((id) => id !== +request.body.uid)
                    }
                    else {
                        response.send({ message: '取消点赞重复', message_code: 2 })
                    }
                }
            })
            fs.writeFile(file, JSON.stringify(database), 'utf-8', (err) => {
                if (err) {
                    response.send({ message: '取消点赞失败', message_code: -1 })
                }
                else {
                    response.send({ message: '取消点赞成功', message_code: 1 })
                }
            })
        }
    })
})

//反对帖子并标记
app.post('/post&action=dislike&target=post', (request, response) => {
    let file = path.join(__dirname, 'data/cauldron.json')
    fs.readFile(file, 'utf-8', function (err, data) {
        if (err) {
            response.send({ message: '文件读取失败', message_code: -1 })
        } else {
            let database = JSON.parse(data)
            database.posts.forEach((post) => {
                if (post.id === +request.body.pid) {
                    //如果之前有过标记，那么就清除之前的标记
                    //实际上前端是会防止这种操作的，发新标记之前需要先清除旧标记，这个是保险
                    post.dislike.forEach((dislike) => {
                        if (dislike.list.includes(+request.body.uid)) {
                            if (dislike.type !== request.body.type) {
                                dislike.list.splice(dislike.list.indexOf(+request.body.uid), 1)
                            }
                            else {
                                response.send({ message: '重复标记', message_code: 2 })
                            }
                        }
                    })
                    //添加新标记
                    post.dislike.forEach((dislike) => {
                        if (dislike.type === request.body.type) {
                            dislike.list.push(+request.body.uid)
                        }
                    })
                }
            })
            fs.writeFile(file, JSON.stringify(database), 'utf-8', (err) => {
                if (err) {
                    response.send({ message: '标记失败', message_code: -1 })
                }
                else {
                    response.send({ message: '标记成功', message_code: 1 })
                }
            })
        }
    })
})

//取消反对标记帖子
app.post('/post&action=cancel_dislike&target=post', (request, response) => {
    let file = path.join(__dirname, 'data/cauldron.json')
    fs.readFile(file, 'utf-8', function (err, data) {
        if (err) {
            response.send({ message: '文件读取失败', message_code: -1 })
        } else {
            let database = JSON.parse(data)
            database.posts.forEach((post) => {
                if (post.id === +request.body.pid) {
                    post.dislike.forEach((dislike) => {
                        if (dislike.list.includes(+request.body.uid)) {
                            dislike.list.splice(dislike.list.indexOf(+request.body.uid), 1)
                        }
                    })
                }
            })
            fs.writeFile(file, JSON.stringify(database), 'utf-8', (err) => {
                if (err) {
                    response.send({ message: '取消标记失败', message_code: -1 })
                }
                else {
                    response.send({ message: '取消标记成功', message_code: 1 })
                }
            })
        }
    })
})

//订阅帖子
app.post('/post&action=subscribe&target=post', (request, response) => {
    let file = path.join(__dirname, 'data/cauldron.json')
    fs.readFile(file, 'utf-8', function (err, data) {
        if (err) {
            response.send({ message: '文件读取失败', message_code: -1 })
        } else {
            let database = JSON.parse(data)
            database.posts.forEach((post) => {
                if (post.id === +request.body.pid) {
                    if (post.subscriptions.includes(+request.body.uid)) {
                        response.send({ message: '订阅重复', message_code: 2 })
                    }
                    else {
                        post.subscriptions.push(+request.body.uid)
                    }
                }
            })
            fs.writeFile(file, JSON.stringify(database), 'utf-8', (err) => {
                if (err) {
                    response.send({ message: '订阅失败', message_code: -1 })
                }
                else {
                    response.send({ message: '订阅成功', message_code: 1 })
                }
            })
        }
    })
})

//取消订阅帖子
app.post('/post&action=cancel_subscribe&target=post', (request, response) => {
    let file = path.join(__dirname, 'data/cauldron.json')
    fs.readFile(file, 'utf-8', function (err, data) {
        if (err) {
            response.send({ message: '文件读取失败', message_code: -1 })
        } else {
            let database = JSON.parse(data)
            database.posts.forEach((post) => {
                if (post.id === +request.body.pid) {
                    let index = post.subscriptions.indexOf(+request.body.uid)
                    if (index !== -1) {
                        response.send({ message: '取消订阅重复', message_code: 2 })
                    } else {
                        post.subscriptions.splice(index, 1)
                    }
                }
            })
            fs.writeFile(file, JSON.stringify(database), 'utf-8', (err) => {
                if (err) {
                    response.send({ message: '取消订阅失败', message_code: -1 })
                }
                else {
                    response.send({ message: '取消订阅成功', message_code: 1 })
                }
            })
        }
    })
})

//点赞帖子评论
app.post('/post&action=like&target=comment', (request, response) => {
})

//取消点赞帖子评论
app.post('/post&action=cancel_like&target=comment', (request, response) => {
})

//举报帖子评论
app.post('/post&action=report&target=comment', (request, response) => {
})

//鼎里投稿暂存
app.post('/post/draft', (request, response) => {
    let file = path.join(__dirname, 'data/cauldron_drafts.json')
    fs.readFile(file, 'utf-8', function (err, data) {
        if (err) {
            response.send('文件读取失败')
        } else {
            let database = JSON.parse(data)
            database.drafts.push(request.body)
            fs.writeFile(file, JSON.stringify(database), 'utf-8', (err) => {
                if (err) {
                    response.send({ message: '保存草稿失败', message_code: -1 })
                }
                else {
                    response.send({ message: '保存草稿成功', message_code: 1 })
                }
            })
        }
    })
})

app.get('/team_square', (request, response) => {
    let file = path.join(__dirname, 'data/team_square.json')
    fs.readFile(file, 'utf-8', function (err, data) {
        if (err) {
            response.send('文件读取失败')
        } else {
            let database = JSON.parse(data)
            let teams = database.teams
            let uid = +request.query.uid
            let result = teams.map((team) => {
                return {
                    tid: team.tid,
                    time: team.time,
                    name: team.name,
                    description: team.description,
                    members: team.members.map((member) => {
                        return {
                            nickname: member.nickname,
                            gender: member.gender,
                            sexual_orientation: member.sexual_orientation,
                            personal_info: member.personal_info,
                            join_time: member.join_time
                        }
                    }),
                    max_members: team.max_members,
                    is_in: team.members.reduce((previous, member) => {
                        return previous || member.uid === uid
                    }, false)
                }
            })
            response.send(JSON.stringify({
                teams: result
            }));
        }
    })
})

app.listen(3000, () => {
    console.log('server running at http://localhost:3000/');
})