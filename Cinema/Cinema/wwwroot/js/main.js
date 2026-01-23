
import { DrawFilmPage } from "./Pages/FilmPage.js";
import { DrawCinemaPage } from "./Pages/CinemaPage.js";

const host = document.body;
let page = 0;
let max_page;

//DrawFilmPage(host, page, max_page)

export function navigate(Page) {
    host.innerHTML = "";
    createHeader(host, Page);

    switch (Page) {
        case 1:
            //drawHomePage(host);
            break;
        case 2:
            DrawCinemaPage(host);
            break;
        case 3:
            DrawFilmPage(host, page, max_page);
            break;
    }
}

/* ========= HEADER ========= */

export function createHeader(host, activePage) {

    const header = document.createElement("div");
    header.classList.add("header");
    host.appendChild(header);

    const title = document.createElement("div");
    title.innerText = "Cinema";
    title.classList.add("title");
    header.appendChild(title);

    const opt = document.createElement("div");
    opt.classList.add("option-bar");
    header.appendChild(opt);

    // ---- HOME ----
    const box1 = document.createElement("div");
    box1.classList.add("box");
    box1.innerText = "Početna strana";
    if (activePage === 1) box1.classList.add("inverse");
    box1.onclick = () => navigate(1);
    opt.appendChild(box1);

    // ---- CINEMAS ----
    const box2 = document.createElement("div");
    box2.classList.add("box");
    box2.innerText = "Bioskopi";
    if (activePage === 2) box2.classList.add("inverse");
    box2.onclick = () => navigate(2);
    opt.appendChild(box2);

    // ---- FILMS ----
    const box3 = document.createElement("div");
    box3.classList.add("box");
    box3.innerText = "Filmovi";
    if (activePage === 3) box3.classList.add("inverse");
    box3.onclick = () => navigate(3);
    opt.appendChild(box3);
}

/* ========= START APP ========= */

navigate(3); // start on Films page (or 1 if you want home)