var Q = require('q');



module.exports = function (pool) {

    var getMenuSQL = 'SELECT p2.ID as id, CASE WHEN p1.post_title = "" THEN p2.post_title ELSE p1.post_title END as title, p2.post_name as name, p1.menu_order as ordering, p2.post_type as type '
        + 'FROM s15_posts as p1 '
        + 'INNER JOIN s15_term_relationships AS TR'
        + ' ON TR.object_id = p1.ID '
        + 'INNER JOIN s15_postmeta AS PM'
        + ' ON PM.post_id = p1.ID '
        + 'INNER JOIN s15_posts AS p2'
        + ' ON p2.ID = PM.meta_value '
        + 'WHERE p1.post_type = "nav_menu_item"'
        + ' AND TR.term_taxonomy_id = 2'
        + ' AND PM.meta_key = "_menu_item_object_id" '
        + 'ORDER BY p1.menu_order ASC';

    var getPostsSQL = 'SELECT s15_posts.ID as id,'
        +'s15_posts.post_date_gmt as date,s15_posts.post_content as content,'
        +'s15_posts.post_title as title,s15_posts.post_name as name,'
        +'s15_users.display_name as author '
        +'FROM s15_posts '
        +'JOIN s15_users ON post_author = s15_users.ID '
        +'WHERE post_status = "publish" AND post_type = "post"'
        +'ORDER BY s15_posts.post_date_gmt DESC;';

    var getPostSQL = 'SELECT s15_posts.ID as id,'
        +'s15_posts.post_date_gmt as date,s15_posts.post_content as content,'
        +'s15_posts.post_title as title,s15_posts.post_name as name,'
        +'s15_users.display_name as author '
        +'FROM s15_posts '
        +'JOIN s15_users ON post_author = s15_users.ID '
        +'WHERE post_status = "publish" AND post_type = "post" AND post_name = ?;';

    var getPagesSQL = 'SELECT ID as id,post_content as content,post_title as title,post_name as name,post_date_gmt as date '
        +'FROM s15_posts '
        +'WHERE post_status = "publish" AND post_type = "page";';

    var getPageSQL = 'SELECT ID as id,post_content as content,post_title as title,post_name as name,post_date_gmt as date '
        +'FROM s15_posts '
        +'WHERE post_status = "publish" AND post_type = "page" AND post_name = ?;';


    var getSponsorsSQL = 'SELECT'
        +'ID,'
        +'post_content as content,'
        +'post_title as title,'
        +'post_name as name,'
        +'website_meta.meta_value as website,'
        +'photophoto.meta_value as photo_url'
        +'FROM s15_posts'
        +'INNER JOIN s15_postmeta as website_meta ON ID = website_meta.post_id AND website_meta.meta_key = "website"'
        +'INNER JOIN s15_postmeta as photometa ON ID = photometa.post_id AND photometa.meta_key = "logo"'
        +'INNER JOIN s15_postmeta as photophoto ON photometa.meta_value = photophoto.post_id AND photophoto.meta_key = "_wp_attached_file"'
        +'WHERE post_status = "publish" AND post_type = "sponssi"';


    function pages() {
        var deferred = Q.defer();
        pool.query(getPagesSQL, function(err, rows, fields) {
            if(err) {
                deferred.reject(err);
            } else {
                deferred.resolve(rows);
            }
        });
        return deferred.promise;
    }

    function posts() {
        var deferred = Q.defer();
        pool.query(getPostsSQL, function(err, rows, fields) {
            if(err) {
                deferred.reject(err);
            } else {
                deferred.resolve(rows);
            }
        });
        return deferred.promise;
    }

    function menu() {
        var deferred = Q.defer();
        pool.query(getMenuSQL, function(err, rows, fields) {
            if(err) {
                deferred.reject(err);
            } else {
                deferred.resolve(rows);
            }
        });
        return deferred.promise;
    }

    function sponsors() {
        var deferred = Q.defer();
        pool.query(getSponsorsSQL, function(err, rows, fields) {
            if(err) {
                deferred.reject(err);
            } else {
                deferred.resolve(rows);
            }
        });
        return deferred.promise;
    }

    function page(slug) {
        var deferred = Q.defer();
        pool.query(getPageSQL, [slug], function(err, rows, fields) {
            if(err) {
                deferred.reject(err);
            } else if (rows.length <= 0) {
                deferred.reject(404);   
            } else {
                deferred.resolve(rows);
            }
        });
        return deferred.promise;
    }

    function post(slug) {
        var deferred = Q.defer();
        pool.query(getPostSQL, [slug], function(err, rows, fields) {
            if(err) {
                deferred.reject(err);
            } else if (rows.length <= 0) {
                deferred.reject(404);   
            } else {
                deferred.resolve(rows);
            }
        });
        return deferred.promise;
    } 


    function getMenu(req, res, next) {
        menu().then(function(m) {
            res.send(m);
            next();
        }, function (err) {
            next(err);
        });
    }

    function getPosts(req, res, next) {
        posts().then(function(m) {
            res.send(m);
            next();
        }, function (err) {
            next(err);
        });
    }

    function getPost(req, res, next) {
        post(req.params.post).then(function(m) {
            res.send(m);
            next();
        }, function (err) {
            next(err);
        });
    }

    function getPages(req, res, next) {
        pages().then(function(m) {
            res.send(m);
            next();
        }, function (err) {
            next(err);
        });
    }

    function getPage(req, res, next) {
        page(req.params.page).then(function(m) {
            res.send(m);
            next();
        }, function (err) {
            next(err);
        });
    }

    function getSponsors(req, res, next) {
        sponsors().then(function(m) {
            res.send(m);
            next();
        }, function (err) {
            next(err);
        });
    }

    function getAll(req, res, next) {
        Q.all([pages(), posts(), menu()]).then(function (data) {
            var result = {
                pages: data[0],
                posts: data[1],
                menu: data[2]
            };
            res.send(result);
            next();
        });
    }

    return {
        all: getAll,
        menu: getMenu,
        posts: getPosts,
        sponsors: getSponsors,
        post: getPost,
        pages: getPages,
        page: getPage
    };
};