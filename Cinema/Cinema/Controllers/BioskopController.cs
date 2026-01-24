using Cinema.DBManager.Entities;
using Cinema.DBManager.Providers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cinema.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class BioskopController : ControllerBase
    {
        public BioskopProvider bioskopProvider { get; set; }
        public BioskopController(BioskopProvider provider)
        {
            this.bioskopProvider = provider;
        }

        [Authorize]
        [HttpGet("ListaBioskopa")]
        public async Task<IActionResult> ListaBioskopa()
        {
            try
            {
                return Ok(bioskopProvider.GetAllCinemas());
            }
            catch(Exception ex)
            {
                return BadRequest("Došlo je do greške: " + ex.Message);
            }
        }

        [Authorize]
        [HttpGet("ListaBioskopa/{grad}")]
        public async Task<IActionResult> ListaBioskopa(string grad)
        {
            try
            {
                return Ok(bioskopProvider.GetAllCinemas(grad));
            }
            catch(Exception ex)
            {
                return BadRequest("Došlo je do greške: " + ex.Message);
            }
        }

        [Authorize]
        [HttpGet("ListaGradova")]
        public async Task<IActionResult> ListaGradova()
        {
            try
            {
                return Ok(bioskopProvider.GetAllCities());
            }
            catch(Exception ex)
            {
                return BadRequest("Došlo je do greške: " + ex.Message);
            }
        }
        [Authorize(Roles = "admin")]
        [HttpPost("DodajBioskop")]
        public async Task<IActionResult> DodajBioskop([FromBody] Bioskop bioskop)
        {
            try
            {
                bioskop.ID = Guid.NewGuid().ToString();
                var res = bioskopProvider.InsertCinema(bioskop);
                if(!res) return BadRequest("Došlo je do greške!");
                else return Ok("Bioskop je uspešno dodat!");
            }
            catch(Exception ex)
            {
                return BadRequest("Došlo je do greške: " + ex.Message);
            }
        }
        [Authorize(Roles = "admin")]
        [HttpPut("IzmeniBioskop")]
        public async Task<IActionResult> IzmeniBioskop([FromBody] Bioskop bioskop)
        {
            try
            {
                var res = bioskopProvider.UpdateCinema(bioskop);
                if(!res) return BadRequest("Došlo je do greške!");
                else return Ok("Bioskop je uspešno Imenjen!");
            }
            catch(Exception ex)
            {
                return BadRequest("Došlo je do greške: " + ex.Message);
            }
        }
        [Authorize(Roles = "admin")]
        [HttpDelete("ObrisiBioskop/{grad}/{id}")]
        public async Task<IActionResult> ObrisiFilm(string grad, string id)
        {
            try
            {
                var res = bioskopProvider.DeleteCinema(grad, id);
                if(!res) return BadRequest("Došlo je do greške!");
                else return Ok("Bioskop je uspresno obrisan");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}