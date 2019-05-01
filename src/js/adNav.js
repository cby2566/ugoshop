export default {
    carousel(){
        let p =document.querySelector('.notice>p:nth-child(2)');
        console.log(p.children)
        //p.children.item(1).style.left='18px';
        console.log(p.children.item(1).offsetHeight)
        console.dir(p);
        setTimeout(function () {
            let el=document.createElement('span');
            el.innerText='新表情';
            p.appendChild(el);
            p.children.item(0).remove();
        },1000);
        // setInterval(function () {
        //     p.children.item(1).left=
        // },100);

    }
}