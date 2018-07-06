using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using LoLStats.Controllers;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LoLStats
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            /*services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });*/


            services.AddMvc();//.SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
            services.AddCors(options =>
                options.AddPolicy("CorsPolicy",
                    builder => builder.AllowAnyHeader().AllowAnyMethod().AllowCredentials().WithOrigins("*"))
            );
            services.AddSignalR();

            services.AddSingleton( s => new DBReader() );
            services.AddSingleton( s => new DBWriter() );
            services.AddSingleton( s => new RiotApiRequester() );
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if( env.IsDevelopment() )
                app.UseDeveloperExceptionPage();

            app.UseDefaultFiles();
            app.UseStaticFiles();
            app.UseCors("CorsPolicy");
            app.UseMvc();
            app.UseSignalR( routes =>
            {
                routes.MapHub<ChatHub>( "/chathub" );
            } );

            var main = new MainController( (DBReader) app.ApplicationServices.GetService( typeof( DBReader ) ),
                (DBWriter) app.ApplicationServices.GetService( typeof( DBWriter ) ),
                (RiotApiRequester) app.ApplicationServices.GetService( typeof( RiotApiRequester ) ) );
        }
    }
}
