using Cinema.DBManager.Entities;
using Cinema.DBManager.Providers;
using Microsoft.AspNetCore.Mvc;

namespace Cinema.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class ProjekcijaController : ControllerBase
    {
        public ProjekcijaProvider projekcijaProvider { get; set; }
        public ProjekcijaController(ProjekcijaProvider projekcijaProvider)
        {
            this.projekcijaProvider = projekcijaProvider;
        }

        [HttpGet("ListaProjekcija/{bioskopID}")]
        public async Task<IActionResult> ListaProjekcija(string bioskopID)
        {
            try
            {
                return Ok(projekcijaProvider.GetAllProjections(bioskopID));
            }
            catch(Exception ex)
            {
                return BadRequest("Došlo je do greške: " + ex.Message);
            }
        }

        [HttpPost("DodajProjekciju")]
        public async Task<IActionResult> DodajProjekciju([FromBody] Projekcija projekcija)
        {
            try
            {
                projekcija.ID = Guid.NewGuid().ToString();
                projekcija.Slika = Path.Combine(projekcija.FilmID + ".jpg");
                var res = projekcijaProvider.InsertProjection(projekcija);
                if(!res) return BadRequest("Došlo je do greške!");
                else return Ok("Projekcija je uspešno dodata!");
            }
            catch(Exception ex)
            {
                return BadRequest("Došlo je do greške: " + ex.Message);
            }
        }

        [HttpPut("IzmeniProjekciju")]
        public async Task<IActionResult> IzmeniProjekciju([FromBody] Projekcija projekcija)
        {
            try
            {
                var res = projekcijaProvider.UpdateProjection(projekcija);
                if(!res) return BadRequest("Došlo je do greške!");
                else return Ok("Projekcija je uspešno izmenjena!");
            }
            catch(Exception ex)
            {
                return BadRequest("Došlo je do greške: " + ex.Message);
            }
        }

        [HttpDelete("ObrisiProjekciju/{bioskopID}/{id}")]
        public async Task<IActionResult> ObrisiProjekciju(string bioskopID, string id)
        {
            try
            {
                var res = projekcijaProvider.DeleteProjection(bioskopID, id);
                if(!res) return BadRequest("Došlo je do greške!");
                else return Ok("Projekcija je uspresno obrisana");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
