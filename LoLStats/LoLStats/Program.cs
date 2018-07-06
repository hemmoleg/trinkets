using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace LoLStats
{
    public class Program
    {
        public static void Main(string[] args)
        {
            //CreateWebHostBuilder(args).Build().Run();
            BuildWebHost(args).Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>();

        public static IWebHost BuildWebHost( string[] args )
        {
            return WebHost.CreateDefaultBuilder( args )
                //.UseElectron(args)
                //.UseUrls( "http://localhost:5001/" )
                //.UseUrls( "http://localhost:44350/" )
                .UseStartup<Startup>()
                .Build();
        }
    }
}
