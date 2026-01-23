import { Cinema } from "../entities/Cinema.js";
import { DrawCinemaInsertPage } from "./CinemaInsertEditPage.js";

export function DrawCinemaPage(host){

    const container = document.createElement("div");
    container.classList.add("cinemaPage");
    host.appendChild(container);

    /* ===== FILTER BAR ===== */

    const filterRow = document.createElement("div");
    filterRow.classList.add("filterRow");
    container.appendChild(filterRow);

    const citySelect = document.createElement("select");
    citySelect.classList.add("select");
    filterRow.appendChild(citySelect);

    const optAll = document.createElement("option");
    optAll.value = "";
    optAll.innerText = "Svi gradovi";
    citySelect.appendChild(optAll);

    fetch("https://localhost:7172/api/Bioskop/ListaGradova")
        .then(r => r.json())
        .then(data => {
            for(const g of data){
                const opt = document.createElement("option");
                opt.value = g;
                opt.innerText = g;
                citySelect.appendChild(opt);
            }
        });

    const searchBtn = document.createElement("button");
    searchBtn.innerText = "Pretraži";
    searchBtn.classList.add("button");
    filterRow.appendChild(searchBtn);

    const addBtn = document.createElement("button");
    addBtn.innerText = "Dodaj bioskop";
    addBtn.classList.add("button");
    filterRow.appendChild(addBtn);

    addBtn.onclick = () => {
        container.innerHTML = "";
        DrawCinemaInsertPage(host, container);
    };

    /* ===== LIST ===== */

    const listContainer = document.createElement("div");
    listContainer.classList.add("cinemaList");
    container.appendChild(listContainer);

    function loadCinemas(grad = ""){
        listContainer.innerHTML = "";

        let url = "https://localhost:7172/api/Bioskop/ListaBioskopa";
        if(grad !== "") url += `/${grad}`;

        fetch(url)
            .then(r => r.json())
            .then(data => {
                for(const d of data){
                    const c = new Cinema(
                        host,
                        container,
                        d.id,
                        d.grad,
                        d.naziv,
                        d.adresa
                    );
                    c.Kartica(listContainer);
                }
            });
    }

    searchBtn.onclick = () => {
        loadCinemas(citySelect.value);
    };

    /* initial load */
    loadCinemas();
}