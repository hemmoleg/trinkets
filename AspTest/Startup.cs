using asptest.Controllers;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace asptest
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
            services.AddMvc();

            services.AddSingleton<DBReader>( s => new DBReader());
            services.AddSingleton<DBWriter>( s => new DBWriter());
            services.AddSingleton<RiotApiRequester>( s => new RiotApiRequester());

            //services.AddSingleton<IUserRepository>(() => new SQLiteUserRepository());
            //services.AddSingleton<IUserRepository>(() => new MySQLUserRepository());
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseDefaultFiles();
            app.UseStaticFiles();
            app.UseMvc();

            MainController main = new MainController((DBReader) app.ApplicationServices.GetService(typeof(DBReader)),
                                                     (DBWriter) app.ApplicationServices.GetService(typeof(DBWriter)),  
                                                     (RiotApiRequester) app.ApplicationServices.GetService(typeof(RiotApiRequester)));
            main.Main();
            
        }
    }
}
