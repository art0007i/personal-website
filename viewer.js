function invalid(a){
  return a == null || a == undefined;
}

function tryFill(obj, val, callback = (el, val) => {el.textContent = val}){
  let el = document.getElementById(val);
  if(invalid(obj[val])){
    el.style.display = 'none';
    return;
  }
  el.style.display = 'block';
  let el2 = document.getElementById(val + "-text");
  if(el2){
    callback(el2, obj[val]);
  }else{
    callback(el, obj[val]);
  }
}

function appendWarn(msg){
  console.warn(msg);
  let warn = document.getElementById('warning');
  if(warn.style.display == 'none'){
    warn.style.display = 'block';
  }
  let msgEl = document.createElement('p');
  msgEl.textContent = "\u26a0 " + msg;
  warn.appendChild(msgEl);
}
function resetWarn(){
  let warn = document.getElementById('warning');
  warn.innerHTML = "";
  warn.style.display = 'none';
}
/*
  This code could be cool but I don't know if I should use it

document.addEventListener('DOMContentLoaded', function(){
  let lnk = document.getElementById('profile-link');
  lnk.value = window.location.host;
  go();
  lnk.value = null;
});
*/

KNOWN_SOCIALS = {
  // Twitter pfp getter would require an api key it seems, and I don't want that.
  'twitter': {icon: 'images/icons/twitter.png'},
  // Neos api has CORS enabled so I can't use it :(
  'neos': {icon: 'images/icons/neos.png', /*async pfpGetter(social, img){
    let NEOS_BLOB = "https://cloudxstorage.blob.core.windows.net/assets/";
    let resp = await fetch(`https://api.neos.com/api/users/${social.userID}`);
    let data = await resp.json();
    if(invalid(data.profile)){
      img.src = NEOS_BLOB + "edb674555b42b4896e2e8535b508a723b67d9407ae476978ec87fb85a6f94d1a"
    }
    let url = data.profile.iconUrl;
    if(url){
      url.replace('neosdb:///', NEOS_BLOB);
      url.replace(/\.[^/.]+$/, "")
      img.src = url;
    }else{
      img.src = NEOS_BLOB + "edb674555b42b4896e2e8535b508a723b67d9407ae476978ec87fb85a6f94d1a";
    }
  }*/
},
  'github': {icon: 'images/icons/github.png', async pfpGetter(social, img){
    img.src = social.link + ".png";
  }}
}

function go(){
  let url = document.getElementById('profile-link').value;
  let btn = document.getElementById('submit');
  var err = document.getElementById('error');
  resetWarn();
  err.style.display = 'none';
  btn.disabled = true;

  if(!(url.startsWith('https://') || url.startsWith('http://'))){
    url = 'https://' + url;
  }else{
    appendWarn("You shouldn't include the protocol in your query");
  }

  if(!url.endsWith('/profile.json')){
    url += '/profile.json';
  }else{
    appendWarn("You shouldn't include /profile.json in your query");
  }
  
  fetch(url).then((response) => {
    response.json().then((data) => {
      console.log(data);
      if(invalid(data.site)){
        throw new ReferenceError("Your profile.json does not contain a site property");
      }
      let site = document.getElementById('site');
      if(data.site.startsWith('https://') || data.site.startsWith('http://')){
        data.site = data.site.replace(/^https?:\/\//, '');
        appendWarn("You shouldn't include the protocol in your site property");
      }
      site.href = "https://" + data.site;
      site.textContent = data.site;

      tryFill(data, 'image', (el, val) => {
        el.src = val;
        el.href = val;
      });

      tryFill(data, 'name');
      tryFill(data, 'birthday');
      tryFill(data, 'pronouns');
      tryFill(data, 'people', (el, val) => {
        el.innerHTML = '';
        val.forEach((person) => {
          let element = document.createElement('li');
          let link = document.createElement('a');
          link.href = "https://" + person;
          link.textContent = person;
          link.addEventListener('click', (e) =>{
            if(e.ctrlKey){
              return;
            }
            let lnk = document.getElementById('profile-link');
            e.preventDefault();
            let store = lnk.value;
            lnk.value = person;
            if(e.shiftKey){
              go();
              lnk.value = store;
            }else{
              let popup = document.getElementById('popup');
              popup.style.left = e.pageX + 'px';
              popup.style.top = e.pageY + 'px';
              popup.style.opacity = 1;
              let attr = parseInt(popup.getAttribute('event-counter'));
              if(isNaN(attr)){popup.setAttribute('event-counter', 0); attr = 0;}
              popup.setAttribute('event-counter', attr + 1);
              setTimeout(() => {
                let evc = popup.getAttribute('event-counter') - 1;
                popup.setAttribute('event-counter', evc);
                if(evc == 0){
                  popup.style.opacity = 0;
                }
              }, 1000);
            }
          });
          element.appendChild(link);
          el.appendChild(element);
        });
        if(data.extensions){
          tryFill(data.extensions, 'socialMedia', (el, val) => {
            el.style.display = 'flex';
            el.innerHTML = '';
            Object.keys(val).forEach((media) => {
              let content = val[media];

              let div = document.createElement('div');
              div.className = "social-div"
              
              let div2 = document.createElement('div');

              if(media in KNOWN_SOCIALS){
                let img = document.createElement('img');
                img.className = "social-icon";
                img.src = KNOWN_SOCIALS[media].icon;
                if(KNOWN_SOCIALS[media].pfpGetter){
                  let pfp = document.createElement('img');
                  pfp.className = "social-pfp";
                  KNOWN_SOCIALS[media].pfpGetter(content, pfp);
                  pfp.alt = "pfp";
                  div.appendChild(pfp);
                }
                div2.appendChild(img);
              }
              console.log(div2.innerHTML);
              let mediaName = document.createElement('span');
              mediaName.textContent = " " + media.charAt(0).toUpperCase() + media.slice(1);;
              div2.appendChild(mediaName);
              div2.innerHTML += "<br>";
              
              console.log(div2.innerHTML);
              let nameEl = null;
              if(content.link){
                nameEl = document.createElement('a');
                nameEl.href = content.link;
              }else{
                nameEl = document.createElement('span');
              }
              nameEl.textContent = content.name;
              if(media == 'neos'){
                nameEl.textContent += " (" + content.userID + ")";
              }
              div2.appendChild(nameEl);
              div.appendChild(div2);
              el.appendChild(div);
            });
          });
          let hasUnrecognized = false;
          let el = document.getElementById("unrecognized");
          Object.keys(data.extensions).forEach((ext) => {
            if(ext != 'socialMedia'){
              hasUnrecognized = true;
              el.innerHTML = '';
              let li = document.createElement('li');
              li.textContent = ext + ": " + JSON.stringify(data.extensions[ext]);
              el.appendChild(li);
            }
          });
          if(!hasUnrecognized){
            el.parentElement.style.display = 'none';
          }else{
            el.parentElement.style.display = 'block';
          }
        }
        document.getElementById('iframe').src = "https://" + data.site;
      });

    }).catch((error) => {
      console.error(error);
      err.style.display = 'initial';
      err.innerHTML = error;
    });
  }).catch((error)=>{
    console.error(error);
    err.style.display = 'initial';
    err.innerHTML = error;
  }).finally(() => {
    btn.disabled = false;
  });
}