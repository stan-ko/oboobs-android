(function(b){var f=function(){var p,i,g,n,l,r,s,h,d,t,o,k,w,z,u={},e=[],x={},q=localStorage.favorite?JSON.parse(localStorage.favorite):{},y=localStorage.votes?JSON.parse(localStorage.votes):{},A=localStorage.first?JSON.parse(localStorage.first):!0,B=Date.now||function(){return+new Date};return{init:function(a){var c=b(document).height(),m=b(document).width(),v=500<c||500<m?!0:!1;defaults={apiurl:"http://api.oboobs.ru/",imgurl:"http://media.oboobs.ru/",buffsize:v?4:2,locale:"en",debug:!1};d=b.extend({},defaults,a||{});t=d.apiurl;o=d.imgurl;k=2>d.buffsize?2:d.buffsize;u.hotzone=function(){return this.y2>b(document).height()/2?"bottom":"top"};p=b("#gallery");i=b("#topbar");g=b("#votebar");n=b("#title");l=b("#btn_favorite");r=b("#favorite");s=b("#by_date");h=b("#rank");f.localise();a=['<div class="prev-buff"><img/></div>','<div class="prev"><img/></div>','<div class="curr"><img/></div>','<div class="next"><img/></div>','<div class="next-buff"><img/></div>'];if(2<k)for(m=3;m<=k;m++)a.unshift('<div class="prev-buff" data-index="-'+m+'"><img/></div>'),a.push('<div class="next-buff" data-index="'+m+'"><img/></div>');p.empty().append(a.join(""));p.children().css("line-height",c+"px");f.checkNew();p.on("swipeLeft",function(){var a=b(".curr"),j=parseInt(a.data("index"));if(j<e.length-1){j++;l.removeClass("taped");g.find(".taped").removeClass("taped");var c=b(".prev-buff").filter('[data-index="'+(j-k-1)+'"]');c.removeClass("prev-buff").addClass("next-buff").data("index",j+k);var d=e[j+k];d?c.children("img").attr("src",o+(v?d.preview.replace("_preview",""):d.preview)):c.children("img").removeAttr("src");b(".prev").removeClass("prev").addClass("prev-buff");a.removeClass("curr").addClass("prev");b(".next").removeClass("next").addClass("curr");b(".next-buff").filter('[data-index="'+(j+1)+'"]').removeClass("next-buff").addClass("next");g.is(".hidden")||f.checkVoice(j);i.is(".hidden")||f.checkFavorite(j);j==e.length-k-3&&!w&&f.preload();h.html(e[j].rank||"");n.html(e[j].model||"")}else a.addClass("next-end"),setTimeout(function(){a.removeClass("next-end")},200)}).on("swipeRight",function(){var a=b(".curr"),c=parseInt(a.data("index"));if(0<c){c--;l.removeClass("taped");g.find(".taped").removeClass("taped");var d=e[c-k];b(".next-buff").filter('[data-index="'+(c+k+1)+'"]').removeClass("next-buff").addClass("prev-buff").data("index",c-k).children("img").attr("src",d?o+(v?d.preview.replace("_preview",""):d.preview):"");b(".next").removeClass("next").addClass("next-buff");a.removeClass("curr").addClass("next");b(".prev").removeClass("prev").addClass("curr");b(".prev-buff").filter('[data-index="'+(c-1)+'"]').removeClass("prev-buff").addClass("prev");g.is(".hidden")||f.checkVoice(c);i.is(".hidden")||f.checkFavorite(c);h.html(e[c].rank||"");n.html(e[c].model||"")}else a.addClass("prev-end"),setTimeout(function(){a.removeClass("prev-end")},200)}).on("touchmove",function(a){b.extend(u,{x2:a.touches[0].pageX,y2:a.touches[0].pageY})}).on("swipeDown",function(){switch(u.hotzone()){case "top":f.checkFavorite();i.removeClass("hidden");break;case "bottom":g.addClass("hidden")}}).on("swipeUp",function(){switch(u.hotzone()){case "top":i.addClass("hidden");break;case "bottom":r.is(".checked")||(f.checkVoice(),g.removeClass("hidden"))}}).on("tap",function(){g.is(".hidden")&&i.is(".hidden")?(f.checkFavorite(),i.removeClass("hidden"),r.is(".checked")||(f.checkVoice(),g.removeClass("hidden"))):(i.addClass("hidden"),r.is(".checked")||g.addClass("hidden"))});g.on("tap","div",function(){if(!g.find(".taped").length){var a=parseInt(b(".curr").data("index")),c=this.id,f=e[a].id;b.ajax({type:"GET",url:"http://oboobs.ru/"+(d.noise?"a/":"")+"rank/"+c+"/"+f+"/",headers:{"X-Requested-With":"XMLHttpRequest"},success:function(g){y[f]=c;if(!d.noise){e[a].rank=g;try{localStorage.votes=JSON.stringify(y)}catch(m){}}parseInt(b(".curr").data("index"))==a&&h.html(e[a].rank||g)}});b(this).addClass("taped")}});l.on("tap",function(){var a=parseInt(b(".curr").data("index"));if(a=e[a]){var c=a.id,d=b(this);d.toggleClass("taped");d.is(".taped")?q[c]=a:delete q[c];try{localStorage.favorite=JSON.stringify(q)}catch(f){}}});b(window).on("resize",function(){var a=b(document).height(),c=b(document).width();p.children().css("line-height",a+"px");v=500<a||500<c?!0:!1});return this},bind:function(){b(".curr").data("index",0).find("img").attr("src",o+e[0].preview);b(".next").data("index",1);e[1]?b(".next").find("img").attr("src",o+e[1].preview):b(".next").find("img").removeAttr("src");b(".prev").data("index",-1).find("img").removeAttr("src");b(".next-buff").each(function(a){a+=2;b(this).data("index",a);e[a]?b(this).find("img").attr("src",o+e[a].preview):b(this).find("img").removeAttr("src")});b(".prev-buff").each(function(a){b(this).data("index",-a-2).find("img").removeAttr("src")});z||(i.removeClass("hidden"),g.removeClass("hidden"),z=!0);g.is(".hidden")||f.checkVoice(0);i.is(".hidden")||f.checkFavorite(0);var a=e[0].rank,c=e[0].model;void 0!=a&&h.html(a);void 0!=c&&n.html(c);s.is(".checked")&&(localStorage.lastSeen=e[0].id,setTimeout(function(){s.find("sup").remove()},500));A&&(a=b("<div>").attr("id","coach_marks").on("tap",function(){localStorage.first=A=false;b(this).remove()}),b("body").append(a))},show:function(a){w=!1;b(".curr img").attr("src","img/loader.gif");g.find(".taped").removeClass("taped");i.is(".hidden")||setTimeout(function(){f.checkVoice();g.removeClass("hidden")},500);n.empty();l.removeClass("taped");h.empty();d=b.extend(d,{offset:0,limit:30,order:"-id",noise:!1},a||{});d.noise?h.is(".mono")||h.addClass("mono"):h.is(".mono")&&h.removeClass("mono");d.dataurl=d.noise?"noise/":"boobs/";a=[t,d.dataurl];d.noise?a.push(d.limit):a.push([d.offset,d.limit,d.order].join("/"));a=a.join("")+"/?timestamp="+B();b.getJSON(a,function(a){b.isArray(a)&&(e=a,f.bind())});return this},showFavorite:function(){w=!0;b(".curr img").attr("src","img/loader.gif");g.is(".hidden")||g.addClass("hidden");g.find(".taped").removeClass("taped");n.empty();l.removeClass("taped");h.empty();h.is(".mono")&&h.removeClass("mono");e=[];b.each(q,function(a,b){e.unshift(b)});if(e.length)f.bind();else{var a;a=b(document).height();var c=b(document).width();a=320>c?"l":320<=c&&480>=c&&c>a?"m":320<=c&&480>c&&c<a?"m":"h";b(".curr").data("index",0).find("img").attr("src","img/"+a+"/coach-fav-empty.png")}return this},preload:function(){var a=[t,d.dataurl];d.noise?a.push(d.limit):a.push([e.length,d.limit,d.order].join("/"));a=a.join("")+"/?timestamp="+B();b.getJSON(a,function(a){d.noise&&(a=a.filter(function(a){return!e.some(function(b){return b.id==a.id})}));e=e.concat(a)})},checkVoice:function(a){e.length&&(void 0==a&&(a=parseInt(b(".curr").data("index"))),(a=y[e[a].id])&&b("#"+a).addClass("taped"))},checkFavorite:function(a){e.length&&(void 0==a&&(a=parseInt(b(".curr").data("index"))),q[e[a].id]&&l.addClass("taped"))},checkNew:function(){var a=localStorage.lastSeen?parseInt(localStorage.lastSeen):void 0;void 0!=a&&b.getJSON(t+"boobs/0/1/",function(c){b.isArray(c)&&(c=c[0].id-a)&&s.append('<sup class="unwatched">+'+c+"</sup>")})},localise:function(){var a=d.locale;x[a]&&b.each(x[a],function(a,d){b("#"+a).text(d)})},locale:x}}();b.extend(b.fn,{gallery:f.init,galleryShow:f.show,galleryShowFavorite:f.showFavorite,galleryLocale:f.locale})})(Zepto);