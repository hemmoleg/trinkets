using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace asptest
{
    [Route("Function")]
    public class FunctionContoller : Controller
    {
        [HttpPost("GetData")]
        public async Task<IActionResult> GetData([FromBody] Parameters parameters)
        {
            var url = "https://"+parameters.Endpoint+".api.riotgames.com/lol/summoner/v3/summoners/by-name/"+parameters.Name+"?api_key="+parameters.Key;
            var httpClient = new HttpClient();
            var result = await httpClient.GetAsync(url);
            var streamResult = await result.Content.ReadAsStreamAsync();
            return new FileStreamResult(streamResult, result.Content.Headers.ContentType.MediaType);
        }
    }
}