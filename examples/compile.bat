@echo %off
FOR /R %%G in (.) DO @(
 IF EXIST %%G\tsconfig.json (
    @Pushd %%G
    @Echo Compile %%G
    @tsc 2>&1
    @Popd
) ELSE (
   @Echo Skip %%G
))