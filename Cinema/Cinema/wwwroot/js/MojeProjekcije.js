import { DrawUserHeader } from "./Navigation.js";

export class MojeProjekcijePage {
    constructor(host) {
        this.host = host;
        this.username = localStorage.getItem("username");
        this.data = [];
    }

    async DrawPage() {
        this.host.innerHTML = "";
        DrawUserHeader(this.host, "mojeprojekcije");

        const container = document.createElement("div");
        container.classList.add("Container");
        this.host.appendChild(container);

        const title = document.createElement("h2");
        title.innerHTML = `MOJE KARTE <span style="font-size:1.5rem">🎟️</span>`;
        title.className = "page-title";
        container.appendChild(title);

        if (!this.username) {
            container.innerHTML += "<h3 style='text-align:center; color:white;'>Molimo prijavite se.</h3>";
            return;
        }

        const loading = document.createElement("div");
        loading.innerText = "Preuzimanje karata...";
        loading.style.color = "#39ff14";
        loading.style.textAlign = "center";
        loading.style.marginTop = "20px";
        container.appendChild(loading);

        await this.FetchRezervacije();
        container.removeChild(loading);

        this.DrawTickets(container);
    }

    async FetchRezervacije() {
        try {
            const token = localStorage.getItem("token");
            const r = await fetch(`https://localhost:7172/api/Rezervacija/ListaRezervacija/${this.username}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            if(r.ok) this.data = await r.json();
            else this.data = [];
        } catch(e) { console.error(e); }
    }

    DrawTickets(container) {
        if (this.data.length === 0) {
            container.innerHTML += `
                <div style="text-align:center; margin-top:50px; opacity:0.7;">
                    <img src="https://cdn-icons-png.flaticon.com/512/2748/2748558.png" width="100" style="filter: invert(1);">
                    <h3>Nemate rezervisanih karata.</h3>
                </div>`;
            return;
        }

        const grid = document.createElement("div");
        grid.className = "ticket-grid";
        container.appendChild(grid);

        this.data.forEach(rez => {
            const ticket = document.createElement("div");
            ticket.className = "cyber-ticket";

            // Podaci
            const film = rez.NazivFilma || rez.nazivFilma || "Nepoznat film";
            const bioskop = rez.NazivBioskopa || rez.nazivBioskopa || "Bioskop";
            
            const vremeDatum = new Date(rez.Vreme || rez.vreme || rez.VremeProjekcije || rez.vremeProjekcije);
            const datum = vremeDatum.toLocaleDateString('sr-RS');
            const sat = vremeDatum.toLocaleTimeString('sr-RS', {hour: '2-digit', minute:'2-digit'});
            
            // Cena
            const cena = rez.UkupnaCena || rez.ukupnaCena || 0;

            // Sala - Ako ne postoji u bazi, stavljamo "1" kao placeholder
            const sala = rez.BrojSale || rez.brojSale || "1"; 

            ticket.innerHTML = `
                <div class="ticket-left">
                    <div class="ticket-cinema">${bioskop}</div>
                    <div class="ticket-movie">${film}</div>
                    
                    <div class="ticket-info">
                        <div>
                            <span class="label">DATUM</span>
                            <span class="value">${datum}</span>
                        </div>
                        <div>
                            <span class="label">VREME</span>
                            <span class="value">${sat}</span>
                        </div>
                        <div>
                            <span class="label">SALA</span>
                            <span class="value">${sala}</span>
                        </div>
                    </div>
                </div>
                
                <div class="ticket-divider">
                    <div class="notch-top"></div>
                    <div class="line"></div>
                    <div class="notch-bottom"></div>
                </div>

                <div class="ticket-right">
                    <div class="ticket-price">
                        <span class="label">UKUPNO</span>
                        <span class="value">${cena} RSD</span>
                    </div>
                    <button class="btn-cancel-ticket" title="Otkaži rezervaciju">
                        OTKAŽI
                    </button>
                </div>
            `;

            const btnCancel = ticket.querySelector(".btn-cancel-ticket");
            btnCancel.onclick = () => this.OtkaziRezervaciju(rez.ID || rez.id);

            grid.appendChild(ticket);
        });
    }

    async OtkaziRezervaciju(id) {
        if(!confirm("Da li ste sigurni da želite da otkažete ovu rezervaciju?")) return;

        try {
            const token = localStorage.getItem("token");
            const r = await fetch(`https://localhost:7172/api/Rezervacija/DeleteReservation?id=${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(this.username)
            });

            if(r.ok) {
                this.DrawPage();
            } else {
                alert("Greška: " + await r.text());
            }
        } catch(e) { console.error(e); }
    }
}